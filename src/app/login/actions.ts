"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { passwordProblem } from "@/lib/password";

export type FormState = { error?: string; message?: string } | undefined;

// Where the confirmation email should send people back to. It must NOT
// come from the browser's "Origin" header: anyone can fake that, and the
// email link would then point at their website (security review F-08).
// Set NEXT_PUBLIC_SITE_URL to pin it; otherwise use the host this request
// really reached us on.
async function siteUrl() {
  const pinned = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (pinned) return pinned;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
  return `${local ? "http" : "https"}://${host}`;
}

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
  if (!password) {
    return { error: "Enter your password." };
  }

  const supabase = await createClient();

  if (intent === "signup") {
    // The new-password rules apply to sign-up only, so people who already
    // have an account can still sign in.
    const problem = passwordProblem(password, email);
    if (problem) return { error: problem };

    const origin = await siteUrl();

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
