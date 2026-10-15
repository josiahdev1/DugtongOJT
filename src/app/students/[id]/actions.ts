"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The coordinator approves or rejects one time entry.
//
// This only sends the decision. The database does the real work: it
// checks the entry belongs to this coordinator's school, stamps who
// decided and when (the browser cannot fake that), refuses to change the
// student's times, and writes the change to the audit log.
export async function decideEntry(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (
    !UUID_RE.test(entryId) ||
    !UUID_RE.test(studentId) ||
    (decision !== "approved" && decision !== "rejected")
  ) {
    redirect("/dashboard");
  }

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { data, error } = await supabase
    .from("time_entries")
    .update({ status: decision })
    .eq("id", entryId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message = encodeURIComponent(
      "Could not save that decision. Please try again.",
    );
    redirect(`/students/${studentId}?error=${message}`);
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/dashboard");
  redirect(`/students/${studentId}`);
}
