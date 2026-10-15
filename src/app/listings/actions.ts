"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { findStudent, getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

function back(kind: "error" | "message", text: string): never {
  redirect(`/listings?${kind}=${encodeURIComponent(text)}`);
}

// A student applies for an opening, with a short note.
//
// This only sends the application. The database checks the opening is
// published by a verified company, that the student is on a verified
// school's roster, that they have not already applied, and that they have
// fewer than 5 waiting. Applying does not place the student: the company
// answers, and the school's coordinator still does the placement.
export async function applyToListing(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);
  if (!UUID_RE.test(listingId)) redirect("/listings");

  const { supabase, user, school } = await getCurrentUser();
  if (!user) redirect("/login");
  if (school) back("error", "Only students can apply.");

  const student = await findStudent(supabase);
  if (!student) back("error", "Only students on a school roster can apply.");

  const { error } = await supabase
    .from("applications")
    .insert({ listing_id: listingId, student_id: student.id, note });

  if (error) {
    back(
      "error",
      error.code === "23505"
        ? "You already applied for this opening."
        : error.message.includes("at most 5")
          ? "You can have at most 5 applications waiting. Withdraw one first."
          : error.message.includes("not open")
            ? "This opening is no longer taking applications."
            : "Could not send your application. Please try again.",
    );
  }

  revalidatePath("/listings");
  revalidatePath("/my-applications");
  redirect(
    `/my-applications?message=${encodeURIComponent("Application sent. The company will answer it, and your coordinator will place you if it is accepted.")}`,
  );
}
