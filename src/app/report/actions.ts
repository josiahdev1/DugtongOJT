"use server";

import { revalidatePath } from "next/cache";
import { findStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  REPORT_CATEGORIES,
  REPORT_MAX_DAYS_BACK,
  type ReportCategory,
} from "@/lib/reports";
import { shiftDate, todayInManila } from "@/lib/time";

export type ReportState = { error?: string; message?: string } | undefined;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// A student reports a problem at their placement. It goes to their school
// coordinator, who decides it.
export async function fileReport(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const category = String(formData.get("category") ?? "");
  const relatedDate = String(formData.get("related_date") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!(REPORT_CATEGORIES as readonly string[]).includes(category)) {
    return { error: "Choose what happened." };
  }
  if (!DATE_RE.test(relatedDate)) return { error: "Pick the date it happened." };

  const today = todayInManila();
  if (relatedDate > today) return { error: "That date has not happened yet." };
  if (relatedDate < shiftDate(today, -REPORT_MAX_DAYS_BACK)) {
    return {
      error: `You can report something from the last ${REPORT_MAX_DAYS_BACK} days.`,
    };
  }

  if (description.length < 10) {
    return { error: "Please describe what happened in at least 10 characters." };
  }
  if (description.length > 2000) {
    return { error: "Please keep the description under 2000 characters." };
  }

  const supabase = await createClient();
  const student = await findStudent(supabase);
  if (!student) return { error: "You are not on a roster." };

  const { error } = await supabase.from("reports").insert({
    student_id: student.id,
    category: category as ReportCategory,
    related_date: relatedDate,
    description,
  });

  if (error) {
    return { error: "Could not send the report. Please try again." };
  }

  revalidatePath("/report");
  return { message: "Sent to your school coordinator." };
}
