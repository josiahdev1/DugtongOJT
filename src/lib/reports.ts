// The kinds of problem a student can report, and how a report's status is
// shown. The values on the left are what the database stores.
export const REPORT_CATEGORIES = [
  "out_of_scope_work",
  "unsafe_conditions",
  "unrecorded_overtime",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const CATEGORY_LABEL: Record<string, string> = {
  out_of_scope_work: "Work outside the agreed tasks",
  unsafe_conditions: "Unsafe conditions",
  unrecorded_overtime: "Unrecorded overtime",
};

export const REPORT_STATUS_LABEL: Record<string, string> = {
  submitted: "Waiting for the coordinator",
  escalated: "Escalated to Dugtong",
  upheld: "Upheld",
  not_upheld: "Not upheld",
};

// How far back a report's date may be (the database enforces this too).
export const REPORT_MAX_DAYS_BACK = 90;

// A company with several upheld reports is flagged for the Dugtong admins,
// who can mark it "under review" or restore it. Stored in
// companies.review_state.
export const REVIEW_STATE_LABEL: Record<string, string> = {
  none: "No review",
  flagged: "Flagged for review",
  under_review: "Under review",
};

// A company's appeal of an upheld report. Stored in report_appeals.status.
export const APPEAL_STATUS_LABEL: Record<string, string> = {
  submitted: "Appeal sent",
  granted: "Appeal granted",
  denied: "Appeal denied",
};
