"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { parseOptionalDate } from "@/lib/moa";

export type CompanyState = { error?: string; message?: string } | undefined;

// Both MOA dates are optional. If both are given, the MOA has to expire
// after it was signed (the database enforces this too).
function readMoaDates(formData: FormData) {
  const signed = parseOptionalDate(formData.get("moa_signed_on"));
  const expires = parseOptionalDate(formData.get("moa_expires_on"));
  if (!signed.ok || !expires.ok) {
    return { error: "Enter the MOA dates as real calendar dates." } as const;
  }
  if (signed.value && expires.value && expires.value <= signed.value) {
    return { error: "The MOA must expire after the day it was signed." } as const;
  }
  return { signed: signed.value, expires: expires.value } as const;
}

export async function addCompany(
  _prev: CompanyState,
  formData: FormData,
): Promise<CompanyState> {
  const name = String(formData.get("name") ?? "").trim();
  const supervisor = String(formData.get("supervisor_name") ?? "").trim();

  if (!name) return { error: "Enter the company name." };
  if (!supervisor) return { error: "Enter the supervisor's name." };
  if (name.length > 120 || supervisor.length > 120) {
    return { error: "Names can be at most 120 characters." };
  }

  const moa = readMoaDates(formData);
  if ("error" in moa) return { error: moa.error };

  const { supabase, school } = await getCurrentUser();
  if (!school) return { error: "Only a coordinator can add companies." };

  // school_id fills itself in from the signed-in coordinator (database
  // default), and Row Level Security refuses any other value.
  const { error } = await supabase.from("companies").insert({
    name,
    supervisor_name: supervisor,
    moa_signed_on: moa.signed,
    moa_expires_on: moa.expires,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "You already have a company with that name."
          : "Could not add the company. Please try again.",
    };
  }

  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { message: `Added ${name}.` };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Let a supervisor approve hours for one company, by email.
//
// The supervisor signs up with this email and confirms it; the database
// then matches them by the verified email of their login (the same way
// students are matched to a roster). Nothing is sent to them: the
// coordinator tells them to sign up.
export async function addSupervisor(
  _prev: CompanyState,
  formData: FormData,
): Promise<CompanyState> {
  const companyId = String(formData.get("company_id") ?? "");
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!UUID_RE.test(companyId)) return { error: "Unknown company." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };

  const { supabase, school } = await getCurrentUser();
  if (!school) return { error: "Only a coordinator can add a supervisor." };

  // The database refuses a company that is not this school's.
  const { error } = await supabase
    .from("company_supervisors")
    .insert({ company_id: companyId, email });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "That email is already a supervisor here."
          : "Could not add the supervisor. Please try again.",
    };
  }

  revalidatePath("/companies");
  return { message: `Added ${email}. Ask them to sign up with that email.` };
}

// Take a supervisor's access away.
export async function removeSupervisor(formData: FormData) {
  const supervisorId = String(formData.get("supervisor_id") ?? "");
  if (!UUID_RE.test(supervisorId)) return;

  const { supabase, school } = await getCurrentUser();
  if (!school) return;

  await supabase.from("company_supervisors").delete().eq("id", supervisorId);
  revalidatePath("/companies");
}

// Change the MOA dates of a company that already exists.
export async function updateMoa(
  _prev: CompanyState,
  formData: FormData,
): Promise<CompanyState> {
  const companyId = String(formData.get("company_id") ?? "");
  if (!UUID_RE.test(companyId)) return { error: "Unknown company." };

  const moa = readMoaDates(formData);
  if ("error" in moa) return { error: moa.error };

  const { supabase, school } = await getCurrentUser();
  if (!school) return { error: "Only a coordinator can change a MOA." };

  // Row Level Security only lets this match a company of the
  // coordinator's own school; for anyone else's it finds nothing.
  const { data, error } = await supabase
    .from("companies")
    .update({ moa_signed_on: moa.signed, moa_expires_on: moa.expires })
    .eq("id", companyId)
    .select("id");

  if (error || !data || data.length === 0) {
    return { error: "Could not save the MOA dates. Please try again." };
  }

  revalidatePath("/companies");
  revalidatePath("/dashboard");
  return { message: "Saved." };
}

// Called after the browser has uploaded a signed MOA into the private
// bucket. Records which file it is. The database refuses a path that is not
// inside this school's own folder, and a company that is not this school's.
export async function recordMoaDocument(
  companyId: string,
  storagePath: string,
  fileName: string,
): Promise<{ error?: string } | undefined> {
  if (!UUID_RE.test(companyId)) return { error: "Unknown company." };
  if (!storagePath || fileName.length === 0 || fileName.length > 200) {
    return { error: "That file could not be recorded." };
  }

  const { supabase, school } = await getCurrentUser();
  if (!school) return { error: "Only a coordinator can upload a MOA." };

  const { error } = await supabase.from("moa_documents").insert({
    company_id: companyId,
    storage_path: storagePath,
    file_name: fileName,
  });
  if (error) {
    return { error: "That file could not be recorded. Please try again." };
  }

  revalidatePath("/companies");
  return undefined;
}
