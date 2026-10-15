"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DOCUMENT_MAX_BYTES,
  DOCUMENT_TYPES,
  type DocumentKind,
} from "@/lib/employers";
import { createClient } from "@/lib/supabase/client";
import { recordDocument } from "./actions";

// Uploads one document straight from the browser into the PRIVATE bucket,
// then tells the server which file it was. The file goes into a folder
// named after this company, which is the only place the storage rules let
// this company write to.
export function DocumentUploader({
  employerId,
  kind,
  label,
}: {
  employerId: string;
  kind: DocumentKind;
  label: string;
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
    const path = `${employerId}/${kind}-${Date.now()}-${safeName}`;

    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("employer-documents")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setBusy(false);
      setError("The upload failed. Please try again.");
      return;
    }

    const result = await recordDocument(kind, path, file.name);
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`doc-${kind}`}>{label}</Label>
      <Input
        id={`doc-${kind}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        disabled={busy}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {busy && <p className="text-xs text-muted-foreground">Uploading…</p>}
      {done && <p className="text-xs">✓ Uploaded.</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
