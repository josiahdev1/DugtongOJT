"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

// An admin verifies or rejects a company account, or puts it back to
// "waiting". The database function checks the caller really is an admin.
export async function setEmployerStatus(formData: FormData) {
  const employerId = String(formData.get("employer_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (
    !UUID_RE.test(employerId) ||
    !["pending", "verified", "rejected"].includes(status)
  ) {
    redirect("/admin");
  }

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("admin_set_employer_status", {
    employer: employerId,
    new_status: status,
  });

  if (error) {
    const message = encodeURIComponent("Could not update that company.");
    redirect(`/admin?error=${message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

// An admin verifies (or un-verifies) a school.
//
// This only passes the request on. The database function checks that the
// caller really is an admin, so nothing here can be used by anyone else.
export async function setSchoolVerified(formData: FormData) {
  const schoolId = String(formData.get("school_id") ?? "");
  const verify = formData.get("verify") === "true";
  if (!UUID_RE.test(schoolId)) redirect("/admin");

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("admin_set_school_verified", {
    school: schoolId,
    is_verified: verify,
  });

  if (error) {
    const message = encodeURIComponent("Could not update that school.");
    redirect(`/admin?error=${message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

// An admin decides a report a coordinator escalated. The decision is
// final. The database function checks the caller is an admin and that the
// report really is escalated.
export async function decideEscalatedReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (
    !UUID_RE.test(reportId) ||
    (decision !== "upheld" && decision !== "not_upheld")
  ) {
    redirect("/admin");
  }

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("admin_decide_report", {
    report: reportId,
    decision,
  });

  if (error) {
    const message = encodeURIComponent(
      "Could not save that decision. It may already have been decided.",
    );
    redirect(`/admin?error=${message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

// An admin marks a flagged company "under review", or restores it. After a
// restore, only reports upheld later count towards the next flag.
export async function setCompanyReview(formData: FormData) {
  const companyId = String(formData.get("company_id") ?? "");
  const state = String(formData.get("state") ?? "");
  if (!UUID_RE.test(companyId) || !["under_review", "none"].includes(state)) {
    redirect("/admin");
  }

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("admin_set_company_review", {
    company: companyId,
    new_state: state,
  });

  if (error) {
    const message = encodeURIComponent("Could not update that company.");
    redirect(`/admin?error=${message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}

// An admin decides a company's appeal of an upheld report. The decision is
// final. If it is granted the database turns the report into "not upheld".
export async function decideAppeal(formData: FormData) {
  const appealId = String(formData.get("appeal_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (
    !UUID_RE.test(appealId) ||
    (decision !== "granted" && decision !== "denied")
  ) {
    redirect("/admin");
  }

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("admin_decide_appeal", {
    appeal: appealId,
    decision,
  });

  if (error) {
    const message = encodeURIComponent(
      "Could not save that decision. It may already have been decided.",
    );
    redirect(`/admin?error=${message}`);
  }

  revalidatePath("/admin");
  redirect("/admin");
}
