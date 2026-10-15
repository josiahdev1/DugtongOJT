// A small CSV reader, so the project needs no extra library.
// Handles quoted fields ("Cruz, Juan"), doubled quotes ("") inside them,
// quoted line breaks, Windows (\r\n) line endings and a leading BOM
// (the invisible mark Excel adds to the start of a UTF-8 file).
//
// Returns one array of strings per line. Fully empty lines are KEPT, so
// the position of a row in the result matches the row number the user
// sees in Excel (header = row 1).
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }

  // Last line without a trailing newline.
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
