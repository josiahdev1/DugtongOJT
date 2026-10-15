"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UUID_RE } from "@/lib/ids";

// A student withdraws an application that is still waiting for an answer.
// The database refuses to change one that has already been answered.
export async function withdrawApplication(formData: FormData) {
  const id = String(formData.get("application_id") ?? "");
  if (!UUID_RE.test(id)) redirect("/my-applications");

  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("applications")
    .update({ status: "withdrawn" })
    .eq("id", id)
    .eq("status", "sent")
    .select("id");

  if (error || !data || data.length === 0) {
    redirect(
      `/my-applications?error=${encodeURIComponent("Could not withdraw that application. It may already have been answered.")}`,
    );
  }

  revalidatePath("/my-applications");
  revalidatePath("/listings");
  redirect(
    `/my-applications?message=${encodeURIComponent("Application withdrawn.")}`,
  );
}
