// File name for a saved PDF: "Student Name - School - What it is.pdf".
//
// It uses the student's name exactly as it is on the roster, so there is
// no guessing which part is the surname.
export function pdfFileName(
  studentName: string,
  schoolName: string,
  what: string,
) {
  // Windows does not allow \ / : * ? " < > | in file names.
  const clean = (s: string) =>
    s.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();

  return `${clean(studentName)} - ${clean(schoolName)} - ${what}.pdf`;
}
