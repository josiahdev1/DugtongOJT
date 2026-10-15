"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_CHARS } from "@/lib/roster";
import { importRoster, previewRoster, type PreviewState } from "./actions";

export function UploadForm() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<PreviewState>();
  const [pending, startTransition] = useTransition();

  async function onFile(file: File | undefined) {
    setPreview(undefined);
    setText("");
    if (!file) return;
    if (file.size > MAX_CHARS) {
      setPreview({ error: "That file is larger than 1 MB." });
      return;
    }
    const content = await file.text();
    setText(content);
    startTransition(async () => {
      setPreview(await previewRoster(content));
    });
  }

  function onConfirm() {
    startTransition(async () => {
      // On success this redirects to the Dashboard.
      const result = await importRoster(text);
      if (result) setPreview(result);
    });
  }

  const rows = preview?.rows ?? [];
  const errors = preview?.errors ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">CSV file</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <p className="text-xs text-muted-foreground">
          Columns: name, student_id, course, email, company, required_hours.
          Up to 500 students and 1 MB.
        </p>
      </div>

      {pending && !preview && (
        <p className="text-sm text-muted-foreground">Checking the file…</p>
      )}

      {preview?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {preview.error}
        </p>
      )}

      {errors.length > 0 && (
        <div className="flex flex-col gap-3">
          <p role="alert" className="text-sm font-medium text-destructive">
            Nothing was imported. Fix {errors.length === 1 ? "this problem" : `these ${errors.length} problems`} in
            your file and upload it again. Row 1 is the header row.
          </p>
          <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Row</th>
                  <th className="px-3 py-2 font-medium">Column</th>
                  <th className="px-3 py-2 font-medium">Problem</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((e, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 tabular-nums">{e.row}</td>
                    <td className="px-3 py-2 font-mono text-xs">{e.column}</td>
                    <td className="px-3 py-2">{e.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            The file is valid. Check these {rows.length}{" "}
            {rows.length === 1 ? "student" : "students"}, then confirm.
          </p>
          <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Student ID</th>
                  <th className="px-3 py-2 font-medium">Course</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Company</th>
                  <th className="px-3 py-2 text-right font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.student_no} className="border-t border-border">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.student_no}</td>
                    <td className="px-3 py-2">{r.course}</td>
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.company_name}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.required_hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <Button onClick={onConfirm} disabled={pending}>
              {pending
                ? "Importing…"
                : `Confirm import (${rows.length} ${rows.length === 1 ? "student" : "students"})`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
