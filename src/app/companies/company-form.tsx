"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCompany } from "./actions";

export function CompanyForm() {
  const [state, formAction, pending] = useActionState(addCompany, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the boxes after a successful add.
  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Company name</Label>
        <Input id="name" name="name" maxLength={120} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="supervisor_name">Supervisor name</Label>
        <Input
          id="supervisor_name"
          name="supervisor_name"
          maxLength={120}
          required
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.error}
        </p>
      )}
      {state?.message && (
        <p role="status" className="text-sm">
          {state.message}
        </p>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add company"}
        </Button>
      </div>
    </form>
  );
}
