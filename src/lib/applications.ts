// A student's application for an OJT opening, and how it is shown. The
// values on the left are what the database stores.
export type MyApplication = {
  id: string;
  listing_id: string;
  listing_title: string;
  company_name: string;
  note: string;
  status: "sent" | "accepted" | "declined" | "withdrawn";
  created_at: string;
};

// What a company sees (employer_applications()): the student's name, ID,
// course and school, never their email.
export type EmployerApplication = {
  id: string;
  listing_id: string;
  listing_title: string;
  student_name: string;
  student_no: string;
  course: string;
  school_name: string;
  note: string;
  status: "sent" | "accepted" | "declined";
  created_at: string;
  decided_at: string | null;
};

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  sent: "Waiting for the company",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

// The most applications a student can have waiting at once (the database
// enforces this too).
export const MAX_WAITING_APPLICATIONS = 5;
