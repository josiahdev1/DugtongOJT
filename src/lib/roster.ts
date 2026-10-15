import { parseCsv } from "@/lib/csv";

// Roster upload rules (agreed with the team):
//   * at most 500 student rows and 1 MB of text
//   * columns: name, student_id, course, email, company, required_hours
//   * all or nothing: if ANY row is bad, nothing is imported
export const MAX_ROWS = 500;
export const MAX_CHARS = 1_000_000;
export const REQUIRED_COLUMNS = [
  "name",
  "student_id",
  "course",
  "email",
  "company",
  "required_hours",
] as const;

export type RosterRow = {
  name: string;
  student_no: string;
  course: string;
  email: string;
  company_id: string;
  company_name: string;
  required_hours: number;
};

// row = the row number as seen in Excel (the header is row 1).
export type RosterError = { row: number; column: string; reason: string };

export type RosterResult = { rows: RosterRow[]; errors: RosterError[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Student ID", "student-id" and "STUDENT_ID" all mean the same column.
function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

// Checks the uploaded text and turns it into clean rows, or a list of
// exactly what is wrong. This runs on the SERVER — never trust the
// browser to have checked it.
export function validateRoster(
  text: string,
  companies: { id: string; name: string }[],
  existing: { studentNos: Set<string>; emails: Set<string> },
): RosterResult {
  const errors: RosterError[] = [];

  if (text.length > MAX_CHARS) {
    return {
      rows: [],
      errors: [{ row: 1, column: "file", reason: "The file is larger than 1 MB." }],
    };
  }

  const table = parseCsv(text);
  const header = (table[0] ?? []).map(normalizeHeader);
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: missing.map((c) => ({
        row: 1,
        column: c,
        reason: `Missing column "${c}". The header row needs: ${REQUIRED_COLUMNS.join(", ")}.`,
      })),
    };
  }

  const idx = (c: string) => header.indexOf(c);
  const body = table.slice(1);
  // Drop empty lines at the very end only (a file usually ends with one).
  while (
    body.length > 0 &&
    body[body.length - 1].every((f) => f.trim() === "")
  ) {
    body.pop();
  }

  if (body.length === 0) {
    return {
      rows: [],
      errors: [{ row: 2, column: "file", reason: "The file has no student rows." }],
    };
  }
  if (body.length > MAX_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          column: "file",
          reason: `The file has ${body.length} students. The limit is ${MAX_ROWS}. Split it into smaller files.`,
        },
      ],
    };
  }

  const companyByName = new Map(
    companies.map((c) => [c.name.trim().toLowerCase(), c]),
  );
  const seenNos = new Map<string, number>();
  const seenEmails = new Map<string, number>();
  const rows: RosterRow[] = [];

  body.forEach((cells, i) => {
    const rowNo = i + 2; // header is row 1
    const get = (c: string) => (cells[idx(c)] ?? "").trim();
    const fail = (column: string, reason: string) =>
      errors.push({ row: rowNo, column, reason });

    const name = get("name");
    const studentNo = get("student_id");
    const course = get("course");
    const email = get("email").toLowerCase();
    const companyName = get("company");
    const hoursText = get("required_hours");

    if (!name) fail("name", "Name is empty.");
    else if (name.length > 120) fail("name", "Name is longer than 120 characters.");

    if (!studentNo) fail("student_id", "Student ID is empty.");
    else if (studentNo.length > 40) fail("student_id", "Student ID is longer than 40 characters.");
    else if (seenNos.has(studentNo.toLowerCase()))
      fail("student_id", `Same student ID as row ${seenNos.get(studentNo.toLowerCase())}.`);
    else if (existing.studentNos.has(studentNo.toLowerCase()))
      fail("student_id", "This student ID is already on your roster.");

    if (!course) fail("course", "Course is empty.");
    else if (course.length > 120) fail("course", "Course is longer than 120 characters.");

    if (!EMAIL_RE.test(email)) fail("email", "Not a valid email address.");
    else if (seenEmails.has(email))
      fail("email", `Same email as row ${seenEmails.get(email)}.`);
    else if (existing.emails.has(email))
      fail("email", "This email is already on your roster.");

    const company = companyByName.get(companyName.toLowerCase());
    if (!companyName) fail("company", "Company is empty.");
    else if (!company)
      fail("company", `No company called "${companyName}". Add it on the Companies page first.`);

    const hours = Number(hoursText);
    if (!hoursText) fail("required_hours", "Required hours is empty.");
    else if (!Number.isInteger(hours) || hours < 1 || hours > 2000)
      fail("required_hours", "Required hours must be a whole number from 1 to 2000.");

    if (studentNo) seenNos.set(studentNo.toLowerCase(), rowNo);
    if (email) seenEmails.set(email, rowNo);

    if (company && errors.length === 0) {
      rows.push({
        name,
        student_no: studentNo,
        course,
        email,
        company_id: company.id,
        company_name: company.name,
        required_hours: hours,
      });
    }
  });

  return { rows: errors.length === 0 ? rows : [], errors };
}
