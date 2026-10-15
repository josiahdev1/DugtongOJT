"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_BYTES } from "@/lib/roster";
import { importRoster, previewRoster, type PreviewState } from "./actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UploadForm() {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<PreviewState>();
  const [pending, startTransition] = useTransition();

  // The file itself goes to the server, which reads and checks it.
  function toFormData(f: File) {
    const data = new FormData();
    data.set("file", f);
    return data;
  }

  function onFile(chosen: File | undefined) {
    setPreview(undefined);
    setFile(undefined);
    if (!chosen) return;
    if (chosen.size > MAX_BYTES) {
      setPreview({ error: "That file is larger than 1 MB." });
      return;
    }
    setFile(chosen);
    startTransition(async () => {
      setPreview(await previewRoster(toFormData(chosen)));
    });
  }

  function onConfirm() {
    if (!file) return;
    startTransition(async () => {
      // On success this redirects to the Dashboard.
      const result = await importRoster(toFormData(file));
      if (result) setPreview(result);
    });
  }

  const rows = preview?.rows ?? [];
  const errors = preview?.errors ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Excel or CSV file</Label>
        <Input
          id="file"
          type="file"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <p className="text-xs text-muted-foreground">
          Columns: STUDENT ID, STUDENT NAME, COURSE, EMAIL, COMPANY, REQUIRED
          HOURS (other columns are ignored). An Excel file can have several
          tabs, one per section. Up to 500 students and 1 MB.
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
          <div className="rounded-[var(--radius)] border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  {errors.some((e) => e.sheet) && <TableHead>Tab</TableHead>}
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Problem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errors.map((e, i) => (
                  <TableRow key={i}>
                    {errors.some((x) => x.sheet) && (
                      <TableCell>{e.sheet}</TableCell>
                    )}
                    <TableCell className="tabular-nums">{e.row}</TableCell>
                    <TableCell className="font-mono text-xs">{e.column}</TableCell>
                    <TableCell>{e.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            The file is valid. Check these {rows.length}{" "}
            {rows.length === 1 ? "student" : "students"}, then confirm.
          </p>
          <div className="rounded-[var(--radius)] border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.student_no}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell className="font-mono text-xs">{r.student_no}</TableCell>
                    <TableCell>{r.course}</TableCell>
                    <TableCell>{r.email}</TableCell>
                    <TableCell>{r.company_name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.required_hours}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
