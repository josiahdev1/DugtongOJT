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
