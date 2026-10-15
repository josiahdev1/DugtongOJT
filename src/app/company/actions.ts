"use server";

import { revalidatePath } from "next/cache";
import { DOCUMENT_KINDS, type DocumentKind } from "@/lib/employers";
import { createClient } from "@/lib/supabase/server";

export type DocumentState = { error?: string } | undefined;

// Called after the browser has uploaded a file into the private bucket.
// Records which file it is. The database refuses a path that is not inside
// this company's own folder, and a document kind that is not on the list.
export async function recordDocument(
  kind: string,
  storagePath: string,
  fileName: string,
): Promise<DocumentState> {
  if (!(DOCUMENT_KINDS as readonly string[]).includes(kind)) {
    return { error: "Unknown document type." };
  }
  if (!storagePath || fileName.length === 0 || fileName.length > 200) {
    return { error: "That file could not be recorded." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("employer_documents").insert({
    kind: kind as DocumentKind,
    storage_path: storagePath,
    file_name: fileName,
  });

  if (error) return { error: "That file could not be recorded. Please try again." };

  revalidatePath("/company");
  return undefined;
}
