"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export type CompanyState = { error?: string; message?: string } | undefined;

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

  const { supabase, school } = await getCurrentUser();
  if (!school) return { error: "Only a coordinator can add companies." };

  // school_id fills itself in from the signed-in coordinator (database
  // default), and Row Level Security refuses any other value.
  const { error } = await supabase
    .from("companies")
    .insert({ name, supervisor_name: supervisor });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "You already have a company with that name."
          : "Could not add the company. Please try again.",
    };
  }

  revalidatePath("/companies");
  return { message: `Added ${name}.` };
}
