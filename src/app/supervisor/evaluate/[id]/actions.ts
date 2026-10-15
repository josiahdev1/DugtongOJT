"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";
import { ALL_CRITERIA } from "@/lib/evaluation";

function text(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

// A supervisor saves (or edits) the evaluation of one of their students.
//
// This only sends what the supervisor typed. The database checks the
// student really is theirs, copies the student's name, course and company
// onto the form, and records who saved it and when.
export async function saveEvaluation(formData: FormData) {
  const studentId = String(formData.get("student_id") ?? "");
  if (!UUID_RE.test(studentId)) redirect("/supervisor");

  const back = `/supervisor/evaluate/${studentId}`;
  const fail = (message: string) =>
    redirect(`${back}?error=${encodeURIComponent(message)}`);

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const ratings: Record<string, number> = {};
  for (const c of ALL_CRITERIA) {
    const value = Number(formData.get(c.key));
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      fail(`Please rate "${c.title}" from 1 to 5.`);
    }
    ratings[c.key] = value;
  }

  const department = text(formData, "department", 120);
  const supervisorName = text(formData, "supervisor_name", 120);
  const supervisorPosition = text(formData, "supervisor_position", 120);
  const strongPoints = text(formData, "strong_points", 2000);
  const improvements = text(formData, "improvements", 2000);
  const comments = text(formData, "comments", 2000);

  if (!department) fail("Please enter the department assigned.");
  if (!supervisorName) fail("Please enter your name.");
  if (!supervisorPosition) fail("Please enter your position.");
  if (!strongPoints) fail("Please describe the trainee's strong points.");
  if (!improvements) {
    fail("Please describe the trainee's areas for improvement.");
  }

  const { error } = await supabase.from("evaluations").upsert(
    {
      student_id: studentId,
      department,
      supervisor_name: supervisorName,
      supervisor_position: supervisorPosition,
      ...ratings,
      strong_points: strongPoints,
      improvements,
      comments,
    },
    { onConflict: "student_id" },
  );

  if (error) fail("Could not save the evaluation. Please try again.");

  revalidatePath("/supervisor");
  redirect(`/evaluations/${studentId}`);
}
