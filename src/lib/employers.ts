// The two documents a company must upload, and how a company's status
// is shown. The values on the left are what the database stores.
export const DOCUMENT_KINDS = ["registration", "permit"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_LABEL: Record<DocumentKind, string> = {
  registration: "DTI or SEC registration",
  permit: "Mayor's or business permit",
};

export const EMPLOYER_STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for review",
  verified: "Verified",
  rejected: "Rejected",
};

// Upload limits. The storage bucket enforces the same limits.
export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
