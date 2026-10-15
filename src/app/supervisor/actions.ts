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

// The supervisor appeals a report that was upheld about their company, once,
// with a written reason.
//
// This only sends the appeal. The database checks the report really is an
// upheld one about one of this supervisor's companies, copies the report
// (never the student) onto the appeal, and refuses a second appeal.
export async function appealReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 2000);
  if (!UUID_RE.test(reportId)) redirect("/supervisor");

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  if (reason.length < 10) {
    const message = encodeURIComponent(
      "Please explain your appeal in at least 10 characters.",
    );
    redirect(`/supervisor?error=${message}`);
  }

  const { error } = await supabase
    .from("report_appeals")
    .insert({ report_id: reportId, reason });

  if (error) {
    const message = encodeURIComponent(
      "Could not send the appeal. This report may already have been appealed.",
    );
    redirect(`/supervisor?error=${message}`);
  }

  revalidatePath("/supervisor");
  redirect("/supervisor");
}
