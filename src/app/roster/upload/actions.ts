"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readRosterFile } from "@/lib/roster-file";
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
async function check(formData: FormData) {
  const { supabase, school } = await getCurrentUser();
  if (!school) {
    return { ok: false as const, failure: "Only a coordinator can upload a roster." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, failure: "Please choose a file." };
  }
  const parsed = await readRosterFile(file);
  if ("error" in parsed) return { ok: false as const, failure: parsed.error };

  const [{ data: companies }, { data: students }] = await Promise.all([
    supabase.from("companies").select("id, name"),
    supabase.from("students").select("student_no, email"),
  ]);

  const result = validateRoster(parsed.sheets, companies ?? [], {
    studentNos: new Set((students ?? []).map((s) => s.student_no.toLowerCase())),
    emails: new Set((students ?? []).map((s) => s.email)),
  });
  return { ok: true as const, supabase, result };
}

// Step 1: show the coordinator what will be imported, or what is wrong.
export async function previewRoster(formData: FormData): Promise<PreviewState> {
  const checked = await check(formData);
  if (!checked.ok) return { error: checked.failure };
  return checked.result;
}

// Step 2: import. The file is checked AGAIN here, because the preview
// came from the browser and anything from the browser can be faked or
// out of date. All rows go in with one insert, so it is all or nothing.
export async function importRoster(formData: FormData): Promise<PreviewState> {
  const checked = await check(formData);
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
