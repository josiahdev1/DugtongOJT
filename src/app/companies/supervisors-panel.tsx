"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSupervisor, removeSupervisor } from "./actions";

export type SupervisorRow = { id: string; email: string };

// The people who can approve hours for one company, plus a form to add one.
export function SupervisorsPanel({
  companyId,
  supervisors,
}: {
  companyId: string;
  supervisors: SupervisorRow[];
}) {
  const [state, formAction, pending] = useActionState(addSupervisor, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col gap-3 pt-2">
      {supervisors.length === 0 ? (
        <p className="text-xs text-muted-foreground">No supervisors yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {supervisors.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground">{s.email}</span>
              <form action={removeSupervisor}>
                <input type="hidden" name="supervisor_id" value={s.id} />
                <Button type="submit" size="sm" variant="outline">
                  Remove
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="company_id" value={companyId} />
        <Label htmlFor={`sup-${companyId}`}>Supervisor&apos;s email</Label>
        <div className="flex gap-2">
          <Input id={`sup-${companyId}`} name="email" type="email" required />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Adding…" : "Add"}
          </Button>
        </div>
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {state.error}
          </p>
        )}
        {state?.message && (
          <p role="status" className="text-sm text-foreground">
            ✓ {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
