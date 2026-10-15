"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  FileText,
  School,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DOCUMENT_KINDS,
  DOCUMENT_LABEL,
  EMPLOYER_STATUS_LABEL,
} from "@/lib/employers";
import { setEmployerStatus, setSchoolVerified } from "../actions";
import type { DocumentRow, EmployerRow } from "../employers-card";

type SchoolRow = {
  id: string;
  name: string;
  created_at: string;
  verified: boolean;
  coordinator_email: string | null;
  student_count: number;
  company_count: number;
};

export function VerificationPanels({
  schools,
  employers,
  documents,
}: {
  schools: SchoolRow[];
  employers: EmployerRow[];
  documents: DocumentRow[];
}) {
  const [schoolFilter, setSchoolFilter] = useState<"all" | "pending" | "verified">("all");
  const [companyFilter, setCompanyFilter] = useState<"all" | "pending" | "verified">("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const latestDoc = (employerId: string, kind: string) =>
    documents.find((d) => d.employer_id === employerId && d.kind === kind);

  // Filter schools
  const filteredSchools = schools.filter((s) => {
    if (schoolFilter === "pending") return !s.verified;
    if (schoolFilter === "verified") return s.verified;
    return true;
  });

  // Filter companies
  const filteredCompanies = employers.filter((e) => {
    if (companyFilter === "pending") return e.status === "pending";
    if (companyFilter === "verified") return e.status === "verified";
    return true;
  });

  const waitingSchoolsCount = schools.filter((s) => !s.verified).length;
  const waitingCompaniesCount = employers.filter((e) => e.status === "pending").length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. SCHOOLS PANEL */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-trust-bg text-trust-text">
                <School className="size-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Schools
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {schools.length} registered · {waitingSchoolsCount} waiting
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSchoolFilter("all")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  schoolFilter === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSchoolFilter("pending")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  schoolFilter === "pending"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pending {waitingSchoolsCount > 0 && `(${waitingSchoolsCount})`}
              </button>
              <button
                type="button"
                onClick={() => setSchoolFilter("verified")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  schoolFilter === "verified"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Verified
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 p-6 pt-0">
          {filteredSchools.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-primary-soft">
                <School className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                No schools in this view
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {schoolFilter === "pending"
                  ? "There are no schools currently awaiting verification."
                  : "No schools matching the current filter."}
              </p>
            </div>
          ) : (
            filteredSchools.map((s) => (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.coordinator_email ?? "No coordinator email"} · Added {s.created_at.slice(0, 10)}
                    </p>
                  </div>
                  <Badge variant={s.verified ? "verified" : "pending"}>
                    {s.verified ? "Verified" : "Waiting"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {s.student_count} students · {s.company_count} partners
                  </span>

                  <div>
                    {confirmId === s.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive font-medium">Remove verification?</span>
                        <form action={setSchoolVerified}>
                          <input type="hidden" name="school_id" value={s.id} />
                          <input type="hidden" name="verify" value="false" />
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs"
                          >
                            Confirm
                          </Button>
                        </form>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : s.verified ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmId(s.id)}
                        className="h-8 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        Remove verification
                      </Button>
                    ) : (
                      <form action={setSchoolVerified}>
                        <input type="hidden" name="school_id" value={s.id} />
                        <input type="hidden" name="verify" value="true" />
                        <Button type="submit" size="sm" className="h-8 text-xs">
                          Verify
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. COMPANIES PANEL */}
      <Card className="rounded-2xl border border-border bg-card shadow-xs">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-teal-bg text-teal-text">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  Companies
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {employers.length} registered · {waitingCompaniesCount} waiting
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCompanyFilter("all")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  companyFilter === "all"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setCompanyFilter("pending")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  companyFilter === "pending"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pending {waitingCompaniesCount > 0 && `(${waitingCompaniesCount})`}
              </button>
              <button
                type="button"
                onClick={() => setCompanyFilter("verified")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  companyFilter === "verified"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Verified
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 p-6 pt-0">
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-surface text-primary-soft">
                <Building2 className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-foreground">
                No companies in this view
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {companyFilter === "pending"
                  ? "There are no companies currently awaiting credential review."
                  : "No companies matching the current filter."}
              </p>
            </div>
          ) : (
            filteredCompanies.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Rep: {e.representative_name} ({e.representative_position}) · {e.owner_email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      e.status === "verified"
                        ? "verified"
                        : e.status === "rejected"
                          ? "rejected"
                          : "pending"
                    }
                  >
                    {EMPLOYER_STATUS_LABEL[e.status] ?? e.status}
                  </Badge>
                </div>

                {/* Documents check */}
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-card/60 p-2.5 text-xs">
                  {DOCUMENT_KINDS.map((kind) => {
                    const doc = latestDoc(e.id, kind);
                    return doc ? (
                      <Link
                        key={kind}
                        href={`/documents/${doc.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-medium text-primary-text hover:underline"
                        title={doc.file_name}
                      >
                        <FileText className="size-3" aria-hidden="true" />
                        <span>{DOCUMENT_LABEL[kind]}</span>
                      </Link>
                    ) : (
                      <span key={kind} className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle className="size-3 text-destructive" aria-hidden="true" />
                        <span>{DOCUMENT_LABEL[kind]}: Missing</span>
                      </span>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    Joined {e.created_at.slice(0, 10)}
                  </span>

                  <div className="flex items-center gap-2">
                    {confirmId === `reject-${e.id}` ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-destructive font-medium">Reject company?</span>
                        <form action={setEmployerStatus}>
                          <input type="hidden" name="employer_id" value={e.id} />
                          <input type="hidden" name="status" value="rejected" />
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs"
                          >
                            Confirm
                          </Button>
                        </form>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        {e.status !== "verified" && (
                          <form action={setEmployerStatus}>
                            <input type="hidden" name="employer_id" value={e.id} />
                            <input type="hidden" name="status" value="verified" />
                            <Button type="submit" size="sm" className="h-8 text-xs">
                              Verify
                            </Button>
                          </form>
                        )}
                        {e.status !== "rejected" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmId(`reject-${e.id}`)}
                            className="h-8 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            Reject
                          </Button>
                        )}
                        {e.status === "verified" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmId(`reject-${e.id}`)}
                            className="h-8 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            Remove verification
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
