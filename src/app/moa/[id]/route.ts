import { NextResponse, type NextRequest } from "next/server";
import { UUID_RE } from "@/lib/ids";
import { createClient } from "@/lib/supabase/server";

// Opens one signed MOA file.
//
// The files are in a private bucket, so there is no permanent link. This
// route makes a signed link that works for 60 seconds, then sends the
// browser to it. Row Level Security decides who gets that far: only the
// coordinator of the school the MOA belongs to. Anyone else gets "not
// found", whether the file exists or not.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const notFound = () =>
    new NextResponse("Not found", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });

  if (!UUID_RE.test(id)) return notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return notFound();

  const { data: document } = await supabase
    .from("moa_documents")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!document) return notFound();

  const { data: signed } = await supabase.storage
    .from("moa-documents")
    .createSignedUrl(document.storage_path, 60);
  if (!signed) return notFound();

  const response = NextResponse.redirect(signed.signedUrl);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
