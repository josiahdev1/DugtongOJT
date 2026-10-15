"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

// The coordinator sends a report they cannot resolve to a Dugtong admin.
// After this only an admin can decide it: the database refuses any change
// from the coordinator, and records who escalated it and when.
export async function escalateReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  if (!UUID_RE.test(reportId)) redirect("/reports");

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { data, error } = await supabase
    .from("reports")
    .update({ status: "escalated" })
    .eq("id", reportId)
    .eq("status", "submitted")
    .select("id");

  if (error || !data || data.length === 0) {
    const message = encodeURIComponent(
      "Could not escalate that report. It may already have been decided.",
    );
    redirect(`/reports?error=${message}`);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports");
}

// The coordinator upholds or does not uphold a report. The decision is
// final: after this the database refuses any further change, and it
// stamps who decided and when.
export async function decideReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (
    !UUID_RE.test(reportId) ||
    (decision !== "upheld" && decision !== "not_upheld")
  ) {
    redirect("/reports");
  }

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { data, error } = await supabase
    .from("reports")
    .update({ status: decision })
    .eq("id", reportId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message = encodeURIComponent(
      "Could not save that decision. It may already have been decided.",
    );
    redirect(`/reports?error=${message}`);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports");
}
