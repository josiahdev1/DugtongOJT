"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { JOURNAL_MAX_CHARS, JOURNAL_MIN_CHARS } from "@/lib/journal";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function back(kind: "error" | "message", text: string): never {
  redirect(`/my-journal?${kind}=${encodeURIComponent(text)}`);
}

// A student writes, or edits, the journal for a day they logged hours.
//
// This only sends the text. The database checks the student really logged
// hours that day, keeps one entry per day, refuses an edit once the entry
// is approved, and sends an edited entry back for approval.
export async function saveJournal(formData: FormData) {
  const workDate = String(formData.get("work_date") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!DATE_RE.test(workDate)) redirect("/my-journal");

  if (body.length < JOURNAL_MIN_CHARS) {
    back(
      "error",
      `Write at least ${JOURNAL_MIN_CHARS} characters: what you did and what you learned.`,
    );
  }
  if (body.length > JOURNAL_MAX_CHARS) {
    back("error", `Keep it under ${JOURNAL_MAX_CHARS} characters.`);
  }

  const { supabase, user, school } = await getCurrentUser();
  if (!user) redirect("/login");
  if (school) redirect("/dashboard");

  const student = await findStudent(supabase);
  if (!student) redirect("/");

  const { data: existing } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("student_id", student.id)
    .eq("work_date", workDate)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("journal_entries").update({ body }).eq("id", existing.id)
    : await supabase
        .from("journal_entries")
        .insert({ student_id: student.id, work_date: workDate, body });

  if (error) {
    back(
      "error",
      error.message.includes("Log your hours")
        ? "Log your hours for that day before writing its journal."
        : "Could not save your journal. It may already have been approved.",
    );
  }

  revalidatePath("/my-journal");
  revalidatePath("/journal");
  back("message", "Saved. Your coordinator will review it.");
}
