"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logHours } from "./actions";

export function LogForm({
  today,
  earliest,
}: {
  today: string;
  earliest: string;
}) {
  const [state, formAction, pending] = useActionState(logHours, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="work_date">Date</Label>
          <Input
            id="work_date"
            name="work_date"
            type="date"
            defaultValue={today}
            min={earliest}
            max={today}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="time_in">Time in</Label>
          <Input id="time_in" name="time_in" type="time" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="time_out">Time out</Label>
          <Input id="time_out" name="time_out" type="time" required />
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Log hours"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Logging a day you already logged edits it, or resubmits it if it was
          rejected. Approved days are locked.
        </p>
      </div>
    </form>
  );
}
