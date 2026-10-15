// What the database functions school_partnerships() and
// employer_partnerships() return, and how a partnership is described.
export type SchoolPartnership = {
  id: string;
  employer_id: string | null;
  kind: "offline" | "platform";
  company_name: string | null;
  status: "requested" | "accepted" | "declined";
  requested_by: "school" | "employer" | null;
  created_at: string;
  decided_at: string | null;
};

export type EmployerPartnership = {
  id: string;
  school_id: string;
  school_name: string;
  status: "requested" | "accepted" | "declined";
  requested_by: "school" | "employer";
  created_at: string;
  decided_at: string | null;
};

export const PARTNERSHIP_STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  accepted: "Accepted",
  declined: "Declined",
};
