"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

// Sign in or create an account. The form says which one with a hidden
// "intent" field.
export async function authenticate(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const intent = formData.get("intent");
  // Emails are stored lowercase everywhere, so Juan@x.com and juan@x.com
  // are the same person.
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Your password needs at least 8 characters." };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    const origin =
      (await headers()).get("origin") ?? "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });
    if (error) return { error: error.message };

    // Safety check. With email confirmation ON, signUp returns no session
    // until the person clicks the link in their email. If we get a session
    // straight away, confirmation is OFF in Supabase — and then anyone
    // could sign up with a classmate's email and match their roster row.
    if (data.session) {
      await supabase.auth.signOut();
      return {
        error:
          "Email confirmation is switched off in Supabase. Ask your team to turn it on (Authentication → Sign In / Providers → Email → Confirm email) before anyone signs up.",
      };
    }

    return {
      message:
        "Check your email. Click the confirmation link we sent, then come back and sign in.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error:
        "Wrong email or password, or you have not confirmed your email yet.",
    };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
