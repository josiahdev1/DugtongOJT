"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_DAYS_BACK,
  shiftDate,
  todayInManila,
} from "@/lib/time";

export type LogState = { error?: string; message?: string } | undefined;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// A student logs one day's time-in and time-out.
// If they already logged that day and it is still pending, this edits it.
export async function logHours(
  _prev: LogState,
  formData: FormData,
): Promise<LogState> {
  const workDate = String(formData.get("work_date") ?? "");
  const timeIn = String(formData.get("time_in") ?? "");
  const timeOut = String(formData.get("time_out") ?? "");

  if (!DATE_RE.test(workDate)) return { error: "Pick a date." };
  if (!TIME_RE.test(timeIn) || !TIME_RE.test(timeOut)) {
    return { error: "Enter both a time in and a time out." };
  }
  if (timeOut <= timeIn) {
    return { error: "Time out must be later than time in." };
  }

  const today = todayInManila();
  if (workDate > today) return { error: "You cannot log a future date." };
  if (workDate < shiftDate(today, -MAX_DAYS_BACK)) {
    return { error: `You can only log the last ${MAX_DAYS_BACK} days.` };
  }

  const supabase = await createClient();

  // Row Level Security returns only the signed-in student's own roster
  // row, matched by their verified email. No row = not on a roster.
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!student) return { error: "You are not on a roster." };

  const { data: existing } = await supabase
    .from("time_entries")
    .select("id, status")
    .eq("student_id", student.id)
    .eq("work_date", workDate)
    .maybeSingle();

  if (existing && existing.status !== "pending") {
    return {
      error: `That day is already ${existing.status}, so it can no longer be changed.`,
    };
  }

  const { error } = existing
    ? await supabase
        .from("time_entries")
        .update({ time_in: timeIn, time_out: timeOut })
        .eq("id", existing.id)
    : await supabase.from("time_entries").insert({
        student_id: student.id,
        work_date: workDate,
        time_in: timeIn,
        time_out: timeOut,
      });

  if (error) {
    return { error: "Could not save that entry. Please try again." };
  }

  revalidatePath("/my-hours");
  return {
    message: existing
      ? "Updated. It is still waiting for approval."
      : "Saved. It is waiting for your coordinator's approval.",
  };
}
