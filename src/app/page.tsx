import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

// Read from Supabase on every visit, not once at build time.
export const dynamic = "force-dynamic";

// Ticket 02 check: ask Supabase how many schools we are allowed to see.
// Signed-out visitors should see 0 — Row Level Security hides every row
// from them. That is a pass: it means the connection works AND the
// table is locked down.
async function checkSupabase() {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("schools")
      .select("id", { count: "exact", head: true });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: `Connected. Schools visible to you: ${count ?? 0}.` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export default async function Home() {
  const status = await checkSupabase();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:py-20">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
          Dugtong OJT
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Track OJT hours without the paperwork.
        </h1>
        <p className="text-base text-muted-foreground">
          Coordinators upload a roster, students log their hours, and the
          coordinator approves them and prints a report.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Connection check</CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={
              status.ok
                ? "text-sm"
                : "text-sm font-medium text-destructive"
            }
          >
            {status.ok ? "✓ " : "✗ "}
            {status.message}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
