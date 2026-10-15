"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { REVIEW_NOTE_MAX_CHARS } from "@/lib/journal";

function back(kind: "error", text: string): never {
  redirect(`/journal?${kind}=${encodeURIComponent(text)}`);
}

// The coordinator approves or rejects one journal entry. A rejection needs a
// note saying what to fix.
//
// This only sends the decision. The database checks the entry belongs to
// this coordinator's school and is still waiting, refuses to change what the
// student wrote, and stamps who decided and when.
export async function decideJournal(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("review_note") ?? "")
    .trim()
    .slice(0, REVIEW_NOTE_MAX_CHARS);

  if (
    !UUID_RE.test(entryId) ||
    (decision !== "approved" && decision !== "rejected")
  ) {
    redirect("/journal");
  }
  if (decision === "rejected" && note.length === 0) {
    back("error", "Say what the student should fix before rejecting an entry.");
  }

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      status: decision,
      review_note: decision === "rejected" ? note : null,
    })
    .eq("id", entryId)
    .eq("status", "submitted")
    .select("id");

  if (error || !data || data.length === 0) {
    back(
      "error",
      "Could not save that decision. It may already have been decided.",
    );
  }

  revalidatePath("/journal");
  revalidatePath("/dashboard");
  redirect("/journal");
}
