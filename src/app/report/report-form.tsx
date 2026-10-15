"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_LABEL, REPORT_CATEGORIES } from "@/lib/reports";
import { fileReport } from "./actions";

export function ReportForm({
  today,
  earliest,
}: {
  today: string;
  earliest: string;
}) {
  const [state, formAction, pending] = useActionState(fileReport, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">What happened?</Label>
          <Select id="category" name="category" required defaultValue="">
            <option value="" disabled>
              Choose one…
            </option>
            {REPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="related_date">Which day?</Label>
          <Input
            id="related_date"
            name="related_date"
            type="date"
            defaultValue={today}
            min={earliest}
            max={today}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Describe what happened</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          minLength={10}
          maxLength={2000}
          required
        />
        <p className="text-xs text-muted-foreground">
          Say what you were asked to do and when. Your coordinator reads this
          first. If it is upheld, your company supervisor can read it too,
          without your name, so please do not write your name in the
          description.
        </p>
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
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send report"}
        </Button>
      </div>
    </form>
  );
}
