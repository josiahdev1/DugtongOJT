import readExcelFile from "read-excel-file/universal";
import { parseCsv } from "@/lib/csv";
import { MAX_BYTES, type Sheet } from "@/lib/roster";

// Turns an uploaded file into plain text tables the validator understands.
// Runs on the SERVER. An .xlsx file is a zip of XML files; the library
// below unzips it and gives back every tab as rows of cells.
export async function readRosterFile(
  file: File,
): Promise<{ sheets: Sheet[] } | { error: string }> {
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_BYTES) return { error: "That file is larger than 1 MB." };

  const lower = file.name.toLowerCase();

  if (lower.endsWith(".csv")) {
    return { sheets: [{ name: file.name, rows: parseCsv(await file.text()) }] };
  }

  if (lower.endsWith(".xlsx")) {
    try {
      const tabs = await readExcelFile(await file.arrayBuffer());
      return {
        sheets: tabs.map((t) => ({
          name: t.sheet,
          rows: t.data.map((row) => row.map(cellToText)),
        })),
      };
    } catch {
      return {
        error:
          "Could not read that Excel file. Save it as .xlsx (Excel Workbook) and try again.",
      };
    }
  }

  return { error: "Please choose an Excel (.xlsx) or CSV (.csv) file." };
}

// A cell can be text, a number, true/false, a date or empty. Everything
// becomes text. Numbers are written without a trailing ".0" (486, not 486.0).
function cellToText(cell: unknown): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  return String(cell);
}
