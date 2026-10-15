"use client";

import { Button } from "@/components/ui/button";

// Opens the browser's print dialog. In that dialog, choosing
// "Save as PDF" as the destination produces the PDF file.
export function PrintButton() {
  return <Button onClick={() => window.print()}>Print / Save as PDF</Button>;
}
