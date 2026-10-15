"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMoa } from "./actions";

// Change one company's MOA dates. Opens from a "Change MOA dates" toggle
// on the Companies page.
export function MoaForm({
  companyId,
  signedOn,
  expiresOn,
}: {
  companyId: string;
  signedOn: string | null;
  expiresOn: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateMoa, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 pt-2">
      <input type="hidden" name="company_id" value={companyId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`signed-${companyId}`}>MOA signed</Label>
          <Input
            id={`signed-${companyId}`}
            name="moa_signed_on"
            type="date"
            defaultValue={signedOn ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`expires-${companyId}`}>MOA expires</Label>
          <Input
            id={`expires-${companyId}`}
            name="moa_expires_on"
            type="date"
            defaultValue={expiresOn ?? ""}
          />
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="text-sm">
          ✓ {state.message}
        </p>
      )}

      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : "Save dates"}
        </Button>
      </div>
    </form>
  );
}
