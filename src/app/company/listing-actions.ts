"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UUID_RE } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";

export type ListingState = { error?: string; message?: string } | undefined;

// A verified company saves a listing as a draft, or publishes it straight
// away. The database is the real gate: it refuses publishing for a company
// that is not verified, and for a listing without a scope of tasks.
export async function createListing(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";
  const course = String(formData.get("course") ?? "");
  const slots = Number(formData.get("slots"));
  const requiredHours = Number(formData.get("required_hours"));
  const hoursPerDay = Number(formData.get("hours_per_day"));
  const schedule = String(formData.get("schedule") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const roleTitle = String(formData.get("role_title") ?? "").trim();
  const scope = String(formData.get("scope_of_tasks") ?? "").trim();

  if (!course) return { error: "Choose a course." };
  if (!Number.isInteger(slots) || slots < 1 || slots > 1000) {
    return { error: "Slots must be a whole number from 1 to 1000." };
  }
  if (!Number.isInteger(requiredHours) || requiredHours < 1 || requiredHours > 2000) {
    return { error: "Required hours must be a whole number from 1 to 2000." };
  }
  if (!(hoursPerDay > 0 && hoursPerDay <= 24)) {
    return { error: "Hours per day must be more than 0 and at most 24." };
  }
  if (!schedule || schedule.length > 200) {
    return { error: "Describe the schedule (up to 200 characters)." };
  }
  if (!city || city.length > 120) {
    return { error: "Enter the city or municipality." };
  }
  if (roleTitle.length > 120) return { error: "The role title is too long." };
  if (scope.length > 4000) return { error: "The scope of tasks is too long." };
  if (intent === "publish" && scope.length < 20) {
    return {
      error:
        "Describe what students will do (at least 20 characters) before publishing. A listing cannot be published without a scope of tasks.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("listings").insert({
    course,
    slots,
    required_hours: requiredHours,
    hours_per_day: hoursPerDay,
    schedule,
    city,
    role_title: roleTitle || null,
    scope_of_tasks: scope,
    status: intent === "publish" ? "published" : "draft",
  });

  if (error) {
    return {
      error: error.message.includes("verified")
        ? "Only a verified company can publish a listing."
        : error.code === "23503"
          ? "Choose a course from the list."
          : "Could not save the listing. Please try again.",
    };
  }

  revalidatePath("/company");
  revalidatePath("/listings");
  return {
    message:
      intent === "publish" ? "Published. It is now on the public page." : "Saved as a draft.",
  };
}

// Publish a draft, close a listing, or reopen a closed one.
export async function setListingStatus(formData: FormData) {
  const listingId = String(formData.get("listing_id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!UUID_RE.test(listingId) || !["published", "closed"].includes(status)) {
    redirect("/company");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId);

  if (error) {
    const message = encodeURIComponent(
      error.message.includes("verified")
        ? "Only a verified company can publish a listing."
        : "Could not update that listing.",
    );
    redirect(`/company?error=${message}`);
  }

  revalidatePath("/company");
  revalidatePath("/listings");
  redirect("/company");
}
