"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

function back(path: string, kind: "error" | "message", text: string): never {
  redirect(`${path}?${kind}=${encodeURIComponent(text)}`);
}

// What a database function said, in words a person can act on. The
// database does the real checking; this only translates its refusals.
function explain(message: string, fallback: string) {
  if (message.includes("must be verified")) return "Your school must be verified first.";
  if (message.includes("not verified")) return "That company is not verified.";
  if (message.includes("already a partnership")) {
    return "There is already a partnership or request with that company.";
  }
  if (message.includes("already been answered")) {
    return "That request has already been answered.";
  }
  if (message.includes("received the request")) {
    return "Only the side that received a request can answer it.";
  }
  return fallback;
}

// A coordinator asks a verified company to partner with their school.
export async function requestPartnership(formData: FormData) {
  const employerId = String(formData.get("employer_id") ?? "");
  const returnTo = formData.get("return_to") === "listings" ? "/listings" : "/partnerships";
  if (!UUID_RE.test(employerId)) redirect(returnTo);

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { error } = await supabase.rpc("request_partnership", {
    p_employer: employerId,
  });
  if (error) {
    back("/partnerships", "error", explain(error.message, "Could not send the request."));
  }

  revalidatePath("/partnerships");
  revalidatePath("/listings");
  back("/partnerships", "message", "Request sent. The company will see it on their page.");
}

// A coordinator answers a request a company sent to their school.
export async function answerPartnership(formData: FormData) {
  const id = String(formData.get("partnership_id") ?? "");
  const accept = formData.get("accept") === "true";
  if (!UUID_RE.test(id)) redirect("/partnerships");

  const { supabase, school } = await getCurrentUser();
  if (!school) redirect("/");

  const { error } = await supabase.rpc("respond_to_partnership", {
    p_id: id,
    p_accept: accept,
  });
  if (error) {
    back("/partnerships", "error", explain(error.message, "Could not save your answer."));
  }

  revalidatePath("/partnerships");
  revalidatePath("/dashboard");
  revalidatePath("/companies");
  back(
    "/partnerships",
    "message",
    accept
      ? "Accepted. The company is now one of your placement companies."
      : "Declined.",
  );
}
