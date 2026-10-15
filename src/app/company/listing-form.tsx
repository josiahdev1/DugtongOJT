"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createListing } from "./listing-actions";

export function ListingForm({ courses }: { courses: string[] }) {
  const [state, formAction, pending] = useActionState(createListing, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="course">Course</Label>
          <Select id="course" name="course" required defaultValue="">
            <option value="" disabled>
              Choose a course…
            </option>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role_title">Role title (optional)</Label>
          <Input id="role_title" name="role_title" maxLength={120} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slots">Number of slots</Label>
          <Input id="slots" name="slots" type="number" min={1} max={1000} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="required_hours">Required hours</Label>
          <Input
            id="required_hours"
            name="required_hours"
            type="number"
            min={1}
            max={2000}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="schedule">Schedule</Label>
          <Input
            id="schedule"
            name="schedule"
            maxLength={200}
            placeholder="Mon to Fri, 8:00 to 17:00"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="hours_per_day">Hours per day</Label>
          <Input
            id="hours_per_day"
            name="hours_per_day"
            type="number"
            min={0.5}
            max={24}
            step={0.5}
            required
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="city">City or municipality</Label>
          <Input id="city" name="city" maxLength={120} required />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="scope_of_tasks">Scope of tasks</Label>
        <Textarea
          id="scope_of_tasks"
          name="scope_of_tasks"
          rows={5}
          maxLength={4000}
          placeholder="What will students actually do? Students agree to this scope, so be specific."
        />
        <p className="text-xs text-muted-foreground">
          Required to publish (at least 20 characters). Everyone can read
          this.
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

      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="intent" value="publish" disabled={pending}>
          {pending ? "Saving…" : "Publish"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="outline"
          disabled={pending}
        >
          Save as draft
        </Button>
      </div>
    </form>
  );
}
