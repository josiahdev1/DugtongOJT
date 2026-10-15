import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell/app-shell";
import { JournalClient } from "./journal-client";

export const dynamic = "force-dynamic";

export default async function MyJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const { user } = await getCurrentUser();

  const currentUser = user ?? { email: "maria.santos@wvsu.edu.ph" };

  return (
    <AppShell
      role="student"
      active="journal"
      title="Log journal"
      description="Document your daily tasks, completed milestones, and attach verification proof for approval."
      user={currentUser}
    >
      {error && (
        <div
          role="alert"
          className="mx-auto w-full max-w-[375px] rounded-[8px] border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
        >
          {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          className="mx-auto w-full max-w-[375px] rounded-[8px] border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400"
        >
          {message}
        </div>
      )}

      <JournalClient />
    </AppShell>
  );
}
