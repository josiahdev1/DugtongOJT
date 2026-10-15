"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

// The coordinator approves or rejects one time entry.
//
// This only sends the decision. The database does the real work: it
// checks the entry belongs to this coordinator's school, stamps who
// decided and when (the browser cannot fake that), refuses to change the
// student's times, and writes the change to the audit log.
export async function decideEntry(formData: FormData) {
  const entryId = String(formData.get("entry_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (
    !UUID_RE.test(entryId) ||
    !UUID_RE.test(studentId) ||
    (decision !== "approved" && decision !== "rejected")
  ) {
    redirect("/dashboard");
  }

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { data, error } = await supabase
    .from("time_entries")
    .update({ status: decision })
    .eq("id", entryId)
    .select("id");

  if (error || !data || data.length === 0) {
    const message = encodeURIComponent(
      "Could not save that decision. Please try again.",
    );
    redirect(`/students/${studentId}?error=${message}`);
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/dashboard");
  redirect(`/students/${studentId}`);
}

// The coordinator issues a student's completion certificate.
//
// The page only shows the button once the hours are reached, but that is
// a convenience. The database is the real gate: it adds up the approved
// hours itself and refuses to create the certificate otherwise.
export async function issueCertificate(formData: FormData) {
  const studentId = String(formData.get("student_id") ?? "");
  if (!UUID_RE.test(studentId)) redirect("/dashboard");

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { error } = await supabase
    .from("certificates")
    .insert({ student_id: studentId });

  // 23505 = a certificate already exists; just show it.
  if (error && error.code !== "23505") {
    const message = encodeURIComponent(
      error.message.includes("required hours")
        ? "This student has not reached the required hours yet."
        : "Could not issue the certificate. Please try again.",
    );
    redirect(`/students/${studentId}?error=${message}`);
  }

  revalidatePath(`/students/${studentId}`);
  redirect(`/students/${studentId}/certificate`);
}

// The coordinator places a student with the company that accepted their
// application. The database checks the application is accepted and one of
// this school's, and that the school already has a partnership with that
// company; otherwise it refuses.
export async function deployStudent(formData: FormData) {
  const applicationId = String(formData.get("application_id") ?? "");
  const studentId = String(formData.get("student_id") ?? "");
  if (!UUID_RE.test(applicationId) || !UUID_RE.test(studentId)) {
    redirect("/dashboard");
  }

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { error } = await supabase.rpc("deploy_student", {
    p_application: applicationId,
  });
  if (error) {
    const message = encodeURIComponent(
      error.message.includes("Partner with this company")
        ? "Partner with this company first, on the Partnerships page. Then you can deploy the student."
        : "Could not deploy the student. Please try again.",
    );
    redirect(`/students/${studentId}?error=${message}`);
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/dashboard");
  redirect(`/students/${studentId}`);
}
