"use client";

import { useState } from "react";
import { Button, Pill, ProgressBar } from "@/components/ui";
import { Check, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type VerificationRow = {
  id: string;
  name: string;
  industry: string;
  docs: string;
  trust: number;
  status: "pending" | "verified" | "rejected";
  category: "all" | "docs" | "low";
};

const INITIAL_QUEUE: VerificationRow[] = [
  {
    id: "aq-1",
    name: "Iloilo Digital Hub",
    industry: "Information Technology",
    docs: "3 / 3",
    trust: 82,
    status: "pending",
    category: "all",
  },
  {
    id: "aq-2",
    name: "Panay Care BPO",
    industry: "BPO",
    docs: "2 / 3",
    trust: 64,
    status: "pending",
    category: "docs",
  },
  {
    id: "aq-3",
    name: "Visayas EduTech",
    industry: "Education",
    docs: "3 / 3",
    trust: 91,
    status: "pending",
    category: "all",
  },
  {
    id: "aq-4",
    name: "QuickServe Staffing",
    industry: "BPO",
    docs: "1 / 3",
    trust: 48,
    status: "pending",
    category: "docs",
  },
  {
    id: "aq-5",
    name: "TechAdvance PH",
    industry: "Information Technology",
    docs: "3 / 3",
    trust: 71,
    status: "verified",
    category: "all",
  },
];

export function AdminVerificationTable() {
  const [items, setItems] = useState<VerificationRow[]>(INITIAL_QUEUE);
  const [filter, setFilter] = useState<"all" | "docs" | "low">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "docs") return item.category === "docs" || item.docs.startsWith("1") || item.docs.startsWith("2");
    if (filter === "low") return item.trust < 70;
    return true;
  });

  const handleAction = (id: string, action: "verify" | "reject") => {
    if (action === "verify") {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "verified" } : i))
      );
      showToast("Company verified and added to public marketplace.");
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Company registration rejected.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="rounded-[12px] border border-border bg-card shadow-sm overflow-hidden">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-[10px] border border-border border-l-4 border-l-primary bg-card p-4 shadow-lg text-sm text-foreground flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <Check className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
        <h3 className="text-[15px] font-medium leading-5 text-foreground">
          Company verification
        </h3>
        <div className="inline-flex rounded-[8px] bg-surface p-0.5" role="tablist">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
              filter === "all"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("docs")}
            className={cn(
              "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
              filter === "docs"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Missing docs
          </button>
          <button
            type="button"
            onClick={() => setFilter("low")}
            className={cn(
              "rounded-[6px] px-3 py-1 text-[13px] font-medium transition-all cursor-pointer",
              filter === "low"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Low trust
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-surface text-[12px] text-muted-foreground border-b border-border">
            <tr>
              <th className="px-3 py-2 font-medium">Company</th>
              <th className="px-3 py-2 font-medium">Industry</th>
              <th className="px-3 py-2 font-medium">Documents</th>
              <th className="px-3 py-2 font-medium">Trust</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Inbox className="size-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-foreground">Nothing in this queue</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All companies in this filter are resolved.</p>
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                    {item.industry}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">
                    {item.docs}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Pill variant="trust">{item.trust}</Pill>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Pill variant={item.status === "verified" ? "verified" : "pending"}>
                      {item.status === "verified" ? "Verified" : "Pending"}
                    </Pill>
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    {item.status === "pending" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="blueOutline"
                          onClick={() => handleAction(item.id, "verify")}
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAction(item.id, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
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

export function AdminTrustAndHealth() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Trust score distribution */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          Trust score distribution
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-foreground">90 – 100</span>
              <span className="font-mono text-muted-foreground">46</span>
            </div>
            <ProgressBar value={72} max={100} color="primary" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-foreground">75 – 89</span>
              <span className="font-mono text-muted-foreground">52</span>
            </div>
            <ProgressBar value={81} max={100} color="primary" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-foreground">60 – 74</span>
              <span className="font-mono text-muted-foreground">21</span>
            </div>
            <ProgressBar value={33} max={100} color="warning" />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-foreground">Below 60</span>
              <span className="font-mono text-muted-foreground">9</span>
            </div>
            <ProgressBar value={14} max={100} color="danger" />
          </div>
        </div>
      </div>

      {/* System health */}
      <div className="rounded-[12px] border border-border bg-card p-4 shadow-sm">
        <h3 className="text-[15px] font-medium leading-5 text-foreground mb-3">
          System health
        </h3>
        <div className="divide-y divide-border text-[13px]">
          <div className="py-2.5 flex items-center justify-between gap-2 first:pt-0">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <div className="font-medium text-foreground">API</div>
                <div className="text-xs text-muted-foreground">99.98% uptime · 30 days</div>
              </div>
            </div>
            <Pill variant="approved">Healthy</Pill>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <div className="font-medium text-foreground">File storage</div>
                <div className="text-xs text-muted-foreground">62% of quota</div>
              </div>
            </div>
            <Pill variant="approved">Healthy</Pill>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-2 last:pb-0">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
              <div>
                <div className="font-medium text-foreground">Email delivery</div>
                <div className="text-xs text-muted-foreground">3 bounces in the last hour</div>
              </div>
            </div>
            <Pill variant="pending">Watch</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
