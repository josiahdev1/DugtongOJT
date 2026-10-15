"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Pill } from "@/components/ui";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { setEmployerStatus } from "./actions";

// One company account that is waiting for review (real row from
// admin_list_employers, filtered to status = "pending" by the page).
export type PendingCompany = {
  id: string;
  name: string;
  representative: string;
  ownerEmail: string;
  signedUp: string;
  docsUploaded: number;
  docsRequired: number;
};

type Filter = "all" | "docs";

export function AdminVerificationTable({
  companies,
}: {
  companies: PendingCompany[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  // Rejecting needs a second click, same as /admin/verifications.
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = companies.filter(
    (c) => filter === "all" || c.docsUploaded < c.docsRequired,
  );

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "docs", label: "Missing docs" },
  ];

  return (
    <div className="rounded-[12px] border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
        <h3 className="text-[15px] font-medium leading-5 text-foreground">
          Company verification
        </h3>
        <div
          className="inline-flex rounded-[8px] bg-surface p-0.5"
          role="group"
          aria-label="Filter companies"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
                filter === t.id
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface text-[12px] text-muted-foreground border-b border-border">
            <tr>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Representative</th>
              <th className="px-3 py-2 font-medium">Documents</th>
              <th className="px-3 py-2 font-medium">Signed up</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Inbox className="size-8 mx-auto mb-2 text-muted-foreground/40" aria-hidden="true" />
                  <p className="text-sm font-medium text-foreground">Nothing in this queue</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {companies.length === 0
                      ? "No companies are waiting for verification."
                      : "Every waiting company has uploaded all its documents."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.ownerEmail}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                    {c.representative}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">
                    {c.docsUploaded} / {c.docsRequired}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap tabular-nums">
                    {c.signedUp}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Pill variant="pending">Pending</Pill>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {confirmId === c.id ? (
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-xs font-medium text-destructive">Reject company?</span>
                        <form action={setEmployerStatus}>
                          <input type="hidden" name="employer_id" value={c.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <Button type="submit" size="sm" variant="destructive">
                            Confirm
                          </Button>
                        </form>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href="/admin/verifications"
                          className="text-xs font-medium text-primary hover:underline mr-1"
                        >
                          Review documents
                        </Link>
                        <form action={setEmployerStatus}>
                          <input type="hidden" name="employer_id" value={c.id} />
                          <input type="hidden" name="status" value="verified" />
                          <Button type="submit" size="sm" variant="blueOutline">
                            Verify
                          </Button>
                        </form>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(c.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
