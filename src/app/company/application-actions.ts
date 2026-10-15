"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UUID_RE } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";

function back(kind: "error" | "message", text: string): never {
  redirect(`/company?${kind}=${encodeURIComponent(text)}`);
}

// A company accepts or declines a student's application. Accepting does not
// place the student: the student's school coordinator still deploys them.
export async function answerApplication(formData: FormData) {
  const id = String(formData.get("application_id") ?? "");
  const accept = formData.get("accept") === "true";
  if (!UUID_RE.test(id)) redirect("/company");

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_application", {
    p_id: id,
    p_accept: accept,
  });
  if (error) {
    back("error", "Could not save your answer. It may already have been answered.");
  }

  revalidatePath("/company");
  back(
    "message",
    accept
      ? "Accepted. The student's school coordinator can now place them with you."
      : "Declined.",
  );
}
