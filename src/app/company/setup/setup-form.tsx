"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCompanyAccount } from "./actions";

export function CompanySetupForm() {
  const [state, formAction, pending] = useActionState(
    createCompanyAccount,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Company name</Label>
        <Input id="name" name="name" maxLength={120} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="representative_name">
          Authorized representative: name
        </Label>
        <Input
          id="representative_name"
          name="representative_name"
          maxLength={120}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="representative_position">
          Authorized representative: position
        </Label>
        <Input
          id="representative_position"
          name="representative_position"
          maxLength={120}
          required
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create company account"}
      </Button>
    </form>
  );
}
