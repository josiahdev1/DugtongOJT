"use server";

import { revalidatePath } from "next/cache";
import { findStudent } from "@/lib/auth";
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

  const student = await findStudent(supabase);
  if (!student) return { error: "You are not on a roster." };

  const { data: existing } = await supabase
    .from("time_entries")
    .select("id, status")
    .eq("student_id", student.id)
    .eq("work_date", workDate)
    .maybeSingle();

  // Pending entries can be edited, and rejected ones can be fixed and
  // sent back. Approved entries are locked.
  if (existing && existing.status === "approved") {
    return {
      error: "That day is already approved, so it can no longer be changed.",
    };
  }

  const { error } = existing
    ? await supabase
        .from("time_entries")
        .update({ time_in: timeIn, time_out: timeOut, status: "pending" })
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
    message: !existing
      ? "Saved. It is waiting for your coordinator's approval."
      : existing.status === "rejected"
        ? "Sent back for approval."
        : "Updated. It is still waiting for approval.",
  };
}
