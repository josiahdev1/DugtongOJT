"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CompanySetupState = { error?: string } | undefined;

export async function createCompanyAccount(
  _prev: CompanySetupState,
  formData: FormData,
): Promise<CompanySetupState> {
  const name = String(formData.get("name") ?? "").trim();
  const repName = String(formData.get("representative_name") ?? "").trim();
  const repPosition = String(formData.get("representative_position") ?? "").trim();

  if (!name) return { error: "Enter your company's name." };
  if (!repName) return { error: "Enter your authorized representative's name." };
  if (!repPosition) return { error: "Enter your authorized representative's position." };
  if (name.length > 120 || repName.length > 120 || repPosition.length > 120) {
    return { error: "Each answer can be at most 120 characters." };
  }

  const supabase = await createClient();

  // create_employer is a database function: it links the signed-in user to
  // the new company, and the company always starts as "pending" until a
  // Dugtong admin verifies it.
  const { error } = await supabase.rpc("create_employer", {
    p_name: name,
    p_representative_name: repName,
    p_representative_position: repPosition,
  });
  if (error) {
    return {
      error: error.message.includes("already have")
        ? "You already have a company account."
        : "Could not create the company account. Please try again.",
    };
  }

  redirect("/company");
}
