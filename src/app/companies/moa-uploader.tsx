"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DOCUMENT_MAX_BYTES, DOCUMENT_TYPES } from "@/lib/employers";
import { createClient } from "@/lib/supabase/client";
import { recordMoaDocument } from "./actions";

// Uploads a company's signed MOA straight from the browser into the PRIVATE
// bucket, then tells the server which file it was. The file goes into a
// folder named after the school, the only place the storage rules let this
// coordinator write to. Every upload is kept; the newest is shown first.
export function MoaUploader({
  schoolId,
  companyId,
}: {
  schoolId: string;
  companyId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);

  async function onFile(file: File | undefined) {
    setError(undefined);
    setDone(false);
    if (!file) return;

    if (!DOCUMENT_TYPES.includes(file.type)) {
      setError("Upload a PDF, JPEG or PNG file.");
      return;
    }
    if (file.size > DOCUMENT_MAX_BYTES) {
      setError("That file is larger than 5 MB.");
      return;
    }

    setBusy(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `${schoolId}/${companyId}/${Date.now()}-${safeName}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("moa-documents")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setBusy(false);
      setError("The upload failed. Please try again.");
      return;
    }

    const result = await recordMoaDocument(companyId, path, file.name);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <Label htmlFor={`moa-file-${companyId}`}>Upload the signed MOA</Label>
      <Input
        id={`moa-file-${companyId}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        disabled={busy}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <p className="text-xs text-muted-foreground">
        PDF, JPEG or PNG, up to 5 MB. Only you can open it.
      </p>
      {busy && <p className="text-xs">Uploading…</p>}
      {done && (
        <p role="status" className="text-xs">
          ✓ Uploaded.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive-text">
          {error}
        </p>
      )}
    </div>
  );
}
