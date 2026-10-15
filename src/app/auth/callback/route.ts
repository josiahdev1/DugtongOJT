import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The link in the confirmation email lands here with a one-time `code`.
// We swap the code for a real login session, then send the person home.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/`);
  }

  const message = encodeURIComponent(
    "That confirmation link did not work. It may have expired. Try signing in, or create the account again.",
  );
  return NextResponse.redirect(`${origin}/login?error=${message}`);
}
