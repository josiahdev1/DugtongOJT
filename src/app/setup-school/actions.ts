"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SetupState = { error?: string } | undefined;

export async function createSchool(
  _prev: SetupState,
  formData: FormData,
): Promise<SetupState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter your school's name." };
  if (name.length > 120) return { error: "That name is too long." };

  const supabase = await createClient();

  // create_school is a database function that creates the school and
  // links the signed-in user to it in one step (see supabase/sql/001).
  // The database, not this code, decides who the user is.
  const { error } = await supabase.rpc("create_school", {
    school_name: name,
  });
  if (error) {
    // The database refuses some people on purpose (see supabase/sql/024).
    // Say why in plain words instead of "try again", which would not help.
    const m = error.message;
    return {
      error: m.includes("already belong")
        ? "You already have a school."
        : m.includes("student roster")
          ? "This email is on a school's student roster, so it signs in as a student and cannot create a school."
          : m.includes("company account")
            ? "This is a company account, so it cannot create a school."
            : m.includes("supervisor account")
              ? "This is a supervisor account, so it cannot create a school."
              : "Could not create the school. Please try again.",
    };
  }

  redirect("/dashboard");
}
