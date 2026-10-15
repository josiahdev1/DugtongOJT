// Roster upload rules (agreed with the team):
//   * an Excel (.xlsx) file or a CSV file, at most 1 MB
//   * at most 500 student rows in total (all sheets together)
//   * columns: name, student_id, course, email, company, required_hours
//     (the Excel template calls them STUDENT NAME, STUDENT ID, COURSE,
//     EMAIL, COMPANY, REQUIRED HOURS; any other column is ignored)
//   * all or nothing: if ANY row is bad, nothing is imported
export const MAX_ROWS = 500;
export const MAX_BYTES = 1_000_000;
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

// One sheet (tab) of an Excel file, or the single table of a CSV file.
// rows[0] is the header row. Every cell is already turned into text.
export type Sheet = { name: string; rows: string[][] };

// row = the row number as seen in Excel (the header is row 1).
// sheet = the tab name, only set when the file has more than one tab.
export type RosterError = {
  sheet?: string;
  row: number;
  column: string;
  reason: string;
};

export type RosterResult = { rows: RosterRow[]; errors: RosterError[] };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Student ID", "student-id" and "STUDENT_ID" all mean the same column.
// The Excel template says "STUDENT NAME", which is our "name" column.
function normalizeHeader(h: string) {
  const key = h.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return key === "student_name" ? "name" : key;
}

const isBlankRow = (cells: string[]) => cells.every((f) => f.trim() === "");

// Checks the uploaded sheets and turns them into clean rows, or a list of
// exactly what is wrong. This runs on the SERVER — never trust the
// browser to have checked it.
export function validateRoster(
  sheets: Sheet[],
  companies: { id: string; name: string }[],
  existing: { studentNos: Set<string>; emails: Set<string> },
): RosterResult {
  const errors: RosterError[] = [];

  // A tab with nothing in it (no header either) is not a roster tab: skip it.
  const used = sheets.filter((s) => s.rows.some((r) => !isBlankRow(r)));
  const labelled = used.length > 1;

  // Count the student rows first, so a huge file is refused before any work.
  const total = used.reduce(
    (n, s) => n + s.rows.slice(1).filter((r) => !isBlankRow(r)).length,
    0,
  );
  if (used.length === 0 || total === 0) {
    return {
      rows: [],
      errors: [{ row: 2, column: "file", reason: "The file has no student rows." }],
    };
  }
  if (total > MAX_ROWS) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          column: "file",
          reason: `The file has ${total} students. The limit is ${MAX_ROWS}. Split it into smaller files.`,
        },
      ],
    };
  }

  // Every tab must have the columns we need.
  for (const sheet of used) {
    const header = sheet.rows[0].map(normalizeHeader);
    for (const c of REQUIRED_COLUMNS.filter((c) => !header.includes(c))) {
      errors.push({
        sheet: labelled ? sheet.name : undefined,
        row: 1,
        column: c,
        reason: `Missing column "${c}". The header row needs: ${REQUIRED_COLUMNS.join(", ")}.`,
      });
    }
  }
  if (errors.length > 0) return { rows: [], errors };

  const companyByName = new Map(
    companies.map((c) => [c.name.trim().toLowerCase(), c]),
  );
  // Where each student ID / email was first seen, for "same as ..." messages.
  const seenNos = new Map<string, string>();
  const seenEmails = new Map<string, string>();
  const rows: RosterRow[] = [];

  for (const sheet of used) {
    const header = sheet.rows[0].map(normalizeHeader);
    const idx = (c: string) => header.indexOf(c);

    sheet.rows.forEach((cells, i) => {
      if (i === 0 || isBlankRow(cells)) return;
      const rowNo = i + 1; // the header is row 1, as in Excel
      const where = labelled ? `${sheet.name} row ${rowNo}` : `row ${rowNo}`;
      const get = (c: string) => (cells[idx(c)] ?? "").trim();
      const fail = (column: string, reason: string) =>
        errors.push({
          sheet: labelled ? sheet.name : undefined,
          row: rowNo,
          column,
          reason,
        });
      const errorsBefore = errors.length;

      // Extra spaces inside a name ("DEGAYO,  JAYSON") are tidied up.
      const name = get("name").replace(/\s+/g, " ");
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
        fail("student_id", `Same student ID as ${seenNos.get(studentNo.toLowerCase())}.`);
      else if (existing.studentNos.has(studentNo.toLowerCase()))
        fail("student_id", "This student ID is already on your roster.");

      if (!course) fail("course", "Course is empty.");
      else if (course.length > 120) fail("course", "Course is longer than 120 characters.");

      if (!EMAIL_RE.test(email)) fail("email", "Not a valid email address.");
      else if (seenEmails.has(email))
        fail("email", `Same email as ${seenEmails.get(email)}.`);
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

      if (studentNo && !seenNos.has(studentNo.toLowerCase()))
        seenNos.set(studentNo.toLowerCase(), where);
      if (email && !seenEmails.has(email)) seenEmails.set(email, where);

      // Only keep this row if THIS row had no problem.
      if (company && errors.length === errorsBefore) {
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
  }

  return { rows: errors.length === 0 ? rows : [], errors };
}
