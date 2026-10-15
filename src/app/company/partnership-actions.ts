"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UUID_RE } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";

function back(kind: "error" | "message", text: string): never {
  redirect(`/company?${kind}=${encodeURIComponent(text)}`);
}

function explain(message: string, fallback: string) {
  if (message.includes("must be verified")) return "Your company must be verified first.";
  if (message.includes("not verified")) return "That school is not verified.";
  if (message.includes("already a partnership")) {
    return "There is already a partnership or request with that school.";
  }
  if (message.includes("already been answered")) {
    return "That request has already been answered.";
  }
  if (message.includes("received the request")) {
    return "Only the side that received a request can answer it.";
  }
  return fallback;
}

// A verified company asks a verified school to partner with it.
export async function requestSchoolPartnership(formData: FormData) {
  const schoolId = String(formData.get("school_id") ?? "");
  if (!UUID_RE.test(schoolId)) back("error", "Choose a school.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_partnership_with_school", {
    p_school: schoolId,
  });
  if (error) back("error", explain(error.message, "Could not send the request."));

  revalidatePath("/company");
  back("message", "Request sent. The school's coordinator will see it.");
}

// A company answers a request a school sent to it.
export async function answerSchoolRequest(formData: FormData) {
  const id = String(formData.get("partnership_id") ?? "");
  const accept = formData.get("accept") === "true";
  if (!UUID_RE.test(id)) redirect("/company");

  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_partnership", {
    p_id: id,
    p_accept: accept,
  });
  if (error) back("error", explain(error.message, "Could not save your answer."));

  revalidatePath("/company");
  back("message", accept ? "Accepted." : "Declined.");
}
