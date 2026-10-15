"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Saves one sheet of the page (the element with id `targetId`) straight to
// a PDF file, without the browser's print dialog.
//
// It takes a picture of the sheet and places the picture on A4 pages, so
// the text in the PDF cannot be selected. The two libraries are loaded
// only when the button is clicked, so they do not slow down the page.
export function SavePdfButton({
  targetId,
  fileName,
}: {
  targetId: string;
  fileName: string;
}) {
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  async function save() {
    const sheet = document.getElementById(targetId);
    if (!sheet) return;
    setSaving(true);
    setFailed(false);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(sheet, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgW = pageW - margin * 2;
      const pageHeightPx = Math.floor(((pageH - margin * 2) / imgW) * canvas.width);

      // Cut the tall picture into page-sized slices, one per page.
      for (let y = 0, page = 0; y < canvas.height; y += pageHeightPx, page++) {
        const sliceH = Math.min(pageHeightPx, canvas.height - y);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        slice
          .getContext("2d")!
          .drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

        if (page > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL("image/jpeg", 0.95),
          "JPEG",
          margin,
          margin,
          imgW,
          (sliceH / canvas.width) * imgW,
        );
      }

      pdf.save(fileName);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {failed && (
        <span role="alert" className="text-xs text-destructive-text">
          Could not save the PDF. Please try again.
        </span>
      )}
      <Button onClick={save} loading={saving}>
        {saving ? "Saving PDF" : "Save as PDF"}
      </Button>
    </div>
  );
}
