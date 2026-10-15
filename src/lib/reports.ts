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
  upheld: "Upheld",
  not_upheld: "Not upheld",
};

// How far back a report's date may be (the database enforces this too).
export const REPORT_MAX_DAYS_BACK = 90;
