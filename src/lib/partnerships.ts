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

// Linking an offline partner (a company the coordinator typed in) to the
// same company on the platform. What school_links() and
// employer_link_requests() return.
export type SchoolLink = {
  id: string;
  company_id: string;
  company_name: string;
  employer_name: string;
  status: "requested" | "accepted" | "declined";
  created_at: string;
  decided_at: string | null;
};

export type EmployerLinkRequest = {
  id: string;
  school_name: string;
  company_name: string;
  status: "requested" | "accepted" | "declined";
  created_at: string;
  decided_at: string | null;
};

export const LINK_STATUS_LABEL: Record<string, string> = {
  requested: "Waiting for the company",
  accepted: "Linked",
  declined: "Declined",
};
