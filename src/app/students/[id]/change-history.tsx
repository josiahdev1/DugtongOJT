import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_LABEL } from "@/lib/status";
import { shortTime } from "@/lib/time";

type Snapshot = {
  status?: string;
  work_date?: string;
  time_in?: string;
  time_out?: string;
};

export type Change = {
  id: string;
  changed_at: string;
  entry_id: string;
  changed_by: string | null;
  actor_role: string | null;
  old_values: unknown;
  new_values: unknown;
};

const ROLE_LABEL: Record<string, string> = {
  coordinator: "Coordinator",
  supervisor: "Supervisor",
  student: "Student",
  system: "System",
};

// "You (Coordinator)", "Supervisor", "Student"… Older rows were written
// before the role was recorded, so fall back to the old guess for them.
function whoLabel(c: Change, userId: string) {
  const role = c.actor_role ? (ROLE_LABEL[c.actor_role] ?? "Someone") : null;
  if (c.changed_by === userId) return role ? `You (${role})` : "You";
  return role ?? "Student";
}

// "pending → approved" or "08:00–17:00 → 08:00–18:00", whichever changed.
function describeChange(oldV: Snapshot, newV: Snapshot) {
  const parts: string[] = [];
  if (oldV.status !== newV.status) {
    parts.push(
      `${STATUS_LABEL[oldV.status ?? ""] ?? oldV.status} → ${STATUS_LABEL[newV.status ?? ""] ?? newV.status}`,
    );
  }
  if (oldV.time_in !== newV.time_in || oldV.time_out !== newV.time_out) {
    parts.push(
      `${shortTime(oldV.time_in ?? "")}–${shortTime(oldV.time_out ?? "")} → ${shortTime(newV.time_in ?? "")}–${shortTime(newV.time_out ?? "")}`,
    );
  }
  return parts.join("; ");
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// The append-only history of decisions on one student's entries.
export function ChangeHistory({
  changes,
  dateOf,
  userId,
}: {
  changes: Change[];
  dateOf: Map<string, string>;
  userId: string;
}) {
  return (
    <Card>
      <CardHeader className="p-5 pb-3">
        <CardTitle>Change history</CardTitle>
        <CardDescription>
          Audit log of every decision and every change after one. Nobody can
          edit this list.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {changes.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No decisions recorded yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Shift date</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatWhen(c.changed_at)}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {whoLabel(c, userId)}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
                    {dateOf.get(c.entry_id) ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {describeChange(
                      c.old_values as Snapshot,
                      c.new_values as Snapshot,
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
