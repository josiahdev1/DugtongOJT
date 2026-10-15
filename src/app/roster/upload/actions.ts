"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  validateRoster,
  type RosterError,
  type RosterRow,
} from "@/lib/roster";

export type PreviewState = {
  rows?: RosterRow[];
  errors?: RosterError[];
  error?: string;
};

// Load what the validator needs: this school's companies and the students
// already on the roster. Row Level Security means these queries can only
// ever return the signed-in coordinator's own school.
async function check(text: string) {
  const { supabase, school } = await getCurrentUser();
  if (!school) {
    return { ok: false as const, failure: "Only a coordinator can upload a roster." };
  }

  const [{ data: companies }, { data: students }] = await Promise.all([
    supabase.from("companies").select("id, name"),
    supabase.from("students").select("student_no, email"),
  ]);

  const result = validateRoster(text, companies ?? [], {
    studentNos: new Set((students ?? []).map((s) => s.student_no.toLowerCase())),
    emails: new Set((students ?? []).map((s) => s.email)),
  });
  return { ok: true as const, supabase, result };
}

// Step 1: show the coordinator what will be imported, or what is wrong.
export async function previewRoster(text: string): Promise<PreviewState> {
  const checked = await check(text);
  if (!checked.ok) return { error: checked.failure };
  return checked.result;
}

// Step 2: import. The file is checked AGAIN here, because the preview
// came from the browser and anything from the browser can be faked or
// out of date. All rows go in with one insert, so it is all or nothing.
export async function importRoster(text: string): Promise<PreviewState> {
  const checked = await check(text);
  if (!checked.ok) return { error: checked.failure };

  const { rows, errors } = checked.result;
  if (errors.length > 0) return { errors };

  const { error } = await checked.supabase.from("students").insert(
    rows.map((r) => ({
      name: r.name,
      student_no: r.student_no,
      course: r.course,
      email: r.email,
      company_id: r.company_id,
      required_hours: r.required_hours,
    })),
  );
  if (error) {
    return {
      error:
        "Could not save the roster. Nothing was imported. Please try again.",
    };
  }

  redirect(`/dashboard?imported=${rows.length}`);
}
