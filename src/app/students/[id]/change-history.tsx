import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <CardHeader>
        <CardTitle>Change history</CardTitle>
        <CardDescription>
          Every decision and every change after one. Nobody can edit this
          list.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No decisions yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">When</th>
                  <th className="px-3 py-2 font-medium">By</th>
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2 tabular-nums">
                      {formatWhen(c.changed_at)}
                    </td>
                    <td className="px-3 py-2">
                      {whoLabel(c, userId)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {dateOf.get(c.entry_id) ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {describeChange(
                        c.old_values as Snapshot,
                        c.new_values as Snapshot,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
