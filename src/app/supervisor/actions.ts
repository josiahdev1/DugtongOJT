"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

// A supervisor approves or rejects one time entry of a student at their
// company.
//
// This only sends the decision. The database checks the entry belongs to
// one of this supervisor's students, stamps who decided and when, refuses
// to change the student's times, and writes the change to the log.
export async function decideAsSupervisor(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (
    !UUID_RE.test(entryId) ||
    (decision !== "approved" && decision !== "rejected")
  ) {
    redirect("/supervisor");
  }

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("time_entries")
    .update({ status: decision })
    .eq("id", entryId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message = encodeURIComponent(
      "Could not save that decision. Please try again.",
    );
    redirect(`/supervisor?error=${message}`);
  }

  revalidatePath("/supervisor");
  redirect("/supervisor");
}
