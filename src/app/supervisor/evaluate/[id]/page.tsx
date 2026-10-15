import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/auth";
import {
  CRITERIA_GROUPS,
  INSTRUCTIONS,
  RATING_LABELS,
  type Evaluation,
} from "@/lib/evaluation";
import { UUID_RE } from "@/lib/ids";
import { saveEvaluation } from "./actions";

export const dynamic = "force-dynamic";

// The school's OJT evaluation form, filled in by the student's supervisor.
// Coming back to a saved evaluation shows it filled in, ready to edit.
export default async function EvaluatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const { user, supabase } = await getCurrentUser();
  if (!user) redirect("/login");
  if (!UUID_RE.test(id)) notFound();

  const { data: isSupervisor } = await supabase.rpc("is_supervisor");
  if (!isSupervisor) redirect("/");

  // Only this supervisor's own students come back, so anyone else's id
  // looks like "not found".
  const { data: studentData } = await supabase.rpc("supervisor_students");
  const student = (
    (studentData ?? []) as {
      id: string;
      name: string;
      student_no: string;
      course: string;
      company_id: string;
    }[]
  ).find((s) => s.id === id);
  if (!student) notFound();

  const [{ data: company }, { data: existing }] = await Promise.all([
    supabase
      .from("companies")
      .select("name")
      .eq("id", student.company_id)
      .maybeSingle(),
    supabase.from("evaluations").select("*").eq("student_id", id).maybeSingle(),
  ]);
  const saved = existing as Evaluation | null;

  return (
    <AppShell
      role="supervisor"
      active="approvals"
      title={`Evaluate ${student.name}`}
      description={`${student.course} · ${company?.name ?? "—"} · ${student.student_no}`}
      crumbs={[{ label: "Approvals", href: "/supervisor" }]}
      user={user}
      actions={saved ? <Badge variant="approved">Submitted</Badge> : undefined}
    >
      {error && (
        <div
          role="alert"
          className="rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
        >
          {error}
        </div>
      )}

      <form action={saveEvaluation} className="flex max-w-3xl flex-col gap-4">
        <input type="hidden" name="student_id" value={id} />

        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle>PHINMA UI OJT Evaluation SY2526</CardTitle>
            <CardDescription>{INSTRUCTIONS}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5 pt-0">
            <div className="flex flex-wrap gap-2" aria-label="Rating scale">
              {[5, 4, 3, 2, 1].map((n) => (
                <Badge key={n} variant="secondary">
                  <span className="font-mono">{n}</span> {RATING_LABELS[n]}
                </Badge>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="department">Department assigned</Label>
                <Input
                  id="department"
                  name="department"
                  required
                  maxLength={120}
                  defaultValue={saved?.department ?? ""}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="supervisor_name">Supervisor&apos;s name</Label>
                <Input
                  id="supervisor_name"
                  name="supervisor_name"
                  required
                  maxLength={120}
                  defaultValue={saved?.supervisor_name ?? ""}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="supervisor_position">Position</Label>
                <Input
                  id="supervisor_position"
                  name="supervisor_position"
                  required
                  maxLength={120}
                  defaultValue={saved?.supervisor_position ?? ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {CRITERIA_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader className="p-5 pb-3">
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 p-5 pt-0">
              {group.criteria.map((c) => (
                <div
                  key={c.key}
                  className="border-t border-border pt-4 first:border-t-0 first:pt-0"
                >
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-1 text-sm font-medium text-foreground">
                      {c.title}
                    </legend>
                    <p className="text-xs leading-4 text-muted-foreground">
                      {c.description}
                    </p>
                    {/* A 1-5 scale. The radio is hidden but still focusable, so
                      the keyboard works; the label shows the choice. */}
                    <div className="grid grid-cols-5 gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label
                          key={n}
                          className="group flex cursor-pointer flex-col items-center gap-0.5 rounded-[8px] border border-border bg-background px-1.5 py-2 text-center text-foreground transition-colors hover:bg-surface-hover has-[:checked]:border-primary has-[:checked]:bg-trust-bg has-[:checked]:text-trust-text has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-1"
                        >
                          <input
                            type="radio"
                            name={c.key}
                            value={n}
                            required
                            defaultChecked={Number(saved?.[c.key]) === n}
                            className="sr-only"
                          />
                          <span className="font-mono text-sm font-medium tabular-nums">
                            {n}
                          </span>
                          <span className="hidden text-xs leading-4 text-muted-foreground group-has-[:checked]:text-trust-text sm:block">
                            {RATING_LABELS[n]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader className="p-5 pb-3">
            <CardTitle>Your notes</CardTitle>
            <CardDescription>
              Specific examples of behavior help the school improve the program.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-5 pt-0">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="strong_points">
                Describe the trainee&apos;s strong points
              </Label>
              <Textarea
                id="strong_points"
                name="strong_points"
                required
                maxLength={2000}
                defaultValue={saved?.strong_points ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="improvements">
                Describe the trainee&apos;s areas for improvement
              </Label>
              <Textarea
                id="improvements"
                name="improvements"
                required
                maxLength={2000}
                defaultValue={saved?.improvements ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="comments">Comments (optional)</Label>
              <Textarea
                id="comments"
                name="comments"
                maxLength={2000}
                defaultValue={saved?.comments ?? ""}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit">
            {saved ? "Save changes" : "Submit evaluation"}
          </Button>
          <p className="text-xs text-muted-foreground">
            You can save the evaluation as a PDF once it is submitted.
          </p>
        </div>
      </form>
    </AppShell>
  );
}
