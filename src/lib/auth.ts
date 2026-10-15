import { createClient } from "@/lib/supabase/server";

// Who is signed in, and are they a coordinator?
//
// A coordinator is someone with a row in the `coordinators` table. That
// row is created only by the create_school database function, and Row
// Level Security lets a user read only their own row, so this answer
// comes from the database, never from anything the browser sends.
export async function getCurrentUser() {
  const supabase = await createClient();

  // getUser() checks the token with Supabase. Never trust getSession()
  // alone on the server — it only reads the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, school: null };

  const { data: coordinator } = await supabase
    .from("coordinators")
    .select("school_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!coordinator) return { supabase, user, school: null };

  const { data: school } = await supabase
    .from("schools")
    .select("id, name")
    .eq("id", coordinator.school_id)
    .maybeSingle();

  return { supabase, user, school };
}
