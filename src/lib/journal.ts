// A student's journal entry for a day they logged hours. The values on the
// left are what the database stores.
export type JournalEntry = {
  id: string;
  student_id: string;
  work_date: string;
  body: string;
  status: "submitted" | "approved" | "rejected";
  review_note: string | null;
  updated_at: string;
};

export const JOURNAL_STATUS_LABEL: Record<string, string> = {
  submitted: "Waiting for your coordinator",
  approved: "Approved",
  rejected: "Needs changes",
};

// The database enforces the same limits.
export const JOURNAL_MIN_CHARS = 20;
export const JOURNAL_MAX_CHARS = 2000;
export const REVIEW_NOTE_MAX_CHARS = 500;
