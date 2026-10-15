import { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

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
    .select("id, name, verified")
    .eq("id", coordinator.school_id)
    .maybeSingle();

  return { supabase, user, school };
}

// The signed-in student's roster row, or null if they are not on one.
//
// Row Level Security only returns rows that match the user's verified
// email AND belong to a school the team has verified. If the same email
// is on more than one roster, the oldest roster row always wins, so the
// student never lands on a different school from one page load to the next.
export async function findStudent(supabase: Supabase) {
  const { data } = await supabase
    .from("students")
    .select("id, name, student_no, course, company_id, required_hours")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}

// The signed-in user's company account (an "employer"), or null.
// Row Level Security returns only the row the user owns.
export async function findEmployer(supabase: Supabase) {
  const { data } = await supabase
    .from("employers")
    .select(
      "id, name, representative_name, representative_position, status, created_at",
    )
    .maybeSingle();
  return data;
}
