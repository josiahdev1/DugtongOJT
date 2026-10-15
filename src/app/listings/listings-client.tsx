"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, EmptyState, ListingCard, Modal } from "@/components/ui";
import { APPLICATION_STATUS_LABEL } from "@/lib/applications";
import { PARTNERSHIP_STATUS_LABEL } from "@/lib/partnerships";
import { requestPartnership } from "../partnerships/actions";
import { applyToListing } from "./actions";
import { Search } from "lucide-react";

// Only the fields of the `public_listings` view.
export type ListingItem = {
  id: string;
  employerId: string;
  title: string;
  companyName: string;
  city: string;
  isVerified: boolean;
  course: string;
  requiredHours: number;
  slots: number;
  schedule: string;
  hoursPerDay: number;
  description: string;
};

const SELECT_CLASS =
  "rounded-[8px] border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ListingsClient({
  listings,
  courses,
  role,
  appliedTo,
  partnershipWith,
  error,
  message,
}: {
  listings: ListingItem[];
  courses: string[];
  role: "visitor" | "student" | "coordinator" | "other";
  appliedTo: Record<string, string>;
  partnershipWith: Record<string, string>;
  error?: string;
  message?: string;
}) {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [activeListing, setActiveListing] = useState<ListingItem | null>(null);

  const cities = useMemo(
    () => [...new Set(listings.map((l) => l.city))].sort((a, b) => a.localeCompare(b)),
    [listings],
  );

  const q = search.trim().toLowerCase();
  const filtered = listings.filter((item) => {
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.companyName.toLowerCase().includes(q) ||
      item.course.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    const matchesCourse = courseFilter === "all" || item.course === courseFilter;
    const matchesLocation = locationFilter === "all" || item.city === locationFilter;
    return matchesSearch && matchesCourse && matchesLocation;
  });

  const isFiltering = Boolean(search || courseFilter !== "all" || locationFilter !== "all");

  return (
    <div className="flex flex-col">
      {/* Result of the last apply / partnership request (from the server action) */}
      {(error || message) && (
        <div
          role={error ? "alert" : "status"}
          className={
            error
              ? "mx-auto mt-4 w-[calc(100%-2rem)] max-w-[1200px] rounded-[8px] border border-destructive/30 bg-destructive-bg p-3 text-xs font-medium text-destructive-text"
              : "mx-auto mt-4 w-[calc(100%-2rem)] max-w-[1200px] rounded-[8px] border border-border bg-surface p-3 text-xs font-medium text-foreground"
          }
        >
          {error ?? message}
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-surface border-b border-border py-12 px-4 text-center sm:py-16">
        <div className="mx-auto max-w-[700px]">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[44px] sm:leading-[52px]">
            Find your OJT placement in Western Visayas
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Verified partner companies, real slots, and direct coordination with your school.
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex items-center gap-2 rounded-[12px] border border-border bg-card p-2 shadow-sm max-w-[640px] mx-auto">
            <Search className="size-5 text-muted-foreground ml-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, skills, or companies"
              aria-label="Search listings"
              className="w-full border-0 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              aria-label="Filter by course"
              className={SELECT_CLASS}
            >
              <option value="all">All courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filter by location"
              className={SELECT_CLASS}
            >
              <option value="all">All locations</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section aria-label="Openings" className="mx-auto w-full max-w-[1200px] px-4 py-8 lg:px-8">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span aria-live="polite">
            Showing <strong className="text-foreground">{filtered.length}</strong> verified opening
            {filtered.length === 1 ? "" : "s"}
          </span>
          {isFiltering && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCourseFilter("all");
                setLocationFilter("all");
              }}
              className="text-primary hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[12px] border border-border bg-card">
            <EmptyState
              title={isFiltering ? "No openings match your search" : "No openings yet"}
              description={
                isFiltering
                  ? "Try broadening your course or location filter."
                  : "Verified companies post openings here. Check back soon."
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const partnership = partnershipWith[item.employerId];
              const status = appliedTo[item.id];
              return (
                <div key={item.id} className="flex flex-col gap-2">
                  <ListingCard
                    id={item.id}
                    title={item.title}
                    companyName={item.companyName}
                    location={item.city}
                    // The database has no work-setup field, so none is shown.
                    workSetup={"" as never}
                    isVerified={item.isVerified}
                    requiredCourse={item.course}
                    targetHours={item.requiredHours}
                    slotsRemaining={item.slots}
                    applyHref={role === "visitor" ? "/login" : undefined}
                    onApply={role === "student" ? () => setActiveListing(item) : undefined}
                    className="flex-1"
                  />
                  {role === "student" && status && (
                    <p className="px-1 text-xs text-muted-foreground">
                      Your application:{" "}
                      <span className="font-medium text-foreground">
                        {APPLICATION_STATUS_LABEL[status] ?? status}
                      </span>
                    </p>
                  )}
                  {role === "coordinator" &&
                    (partnership ? (
                      <p className="px-1 text-xs text-muted-foreground">
                        Partnership with {item.companyName}:{" "}
                        <span className="font-medium text-foreground">
                          {PARTNERSHIP_STATUS_LABEL[partnership] ?? partnership}
                        </span>
                      </p>
                    ) : (
                      <form action={requestPartnership}>
                        <input type="hidden" name="employer_id" value={item.employerId} />
                        <input type="hidden" name="return_to" value="listings" />
                        <Button type="submit" size="sm" variant="outline">
                          Ask {item.companyName} to partner with my school
                        </Button>
                      </form>
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Application Modal (signed-in students only) */}
      {activeListing && role === "student" && (
        <Modal
          open
          onOpenChange={(open) => {
            if (!open) setActiveListing(null);
          }}
          title={`Apply for ${activeListing.title}`}
          description={`Submit your application to ${activeListing.companyName}.`}
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-[8px] bg-surface p-3 text-xs flex flex-col gap-1.5 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Hours:</span>
                <span className="font-mono font-medium text-foreground">
                  {activeListing.requiredHours} hrs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Course:</span>
                <span className="font-medium text-foreground">{activeListing.course}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Schedule:</span>
                <span className="text-right font-medium text-foreground">
                  {activeListing.schedule}, {activeListing.hoursPerDay} hours a day (
                  {activeListing.city})
                </span>
              </div>
            </div>

            {activeListing.description && (
              <div>
                <h4 className="mb-1 text-xs font-medium text-muted-foreground">
                  What students will do
                </h4>
                <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-foreground">
                  {activeListing.description}
                </p>
              </div>
            )}

            {appliedTo[activeListing.id] ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  Your application:{" "}
                  <span className="font-medium text-foreground">
                    {APPLICATION_STATUS_LABEL[appliedTo[activeListing.id]] ??
                      appliedTo[activeListing.id]}
                  </span>
                </p>
                <Link
                  href="/my-applications"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  My applications
                </Link>
              </div>
            ) : (
              <form action={applyToListing} className="flex flex-col gap-4">
                <input type="hidden" name="listing_id" value={activeListing.id} />
                <div>
                  <label
                    htmlFor="apply-note"
                    className="block text-xs font-medium text-muted-foreground mb-1.5"
                  >
                    A short note to {activeListing.companyName} (optional)
                  </label>
                  <textarea
                    id="apply-note"
                    name="note"
                    maxLength={1000}
                    placeholder="Why this opening, and what you can do."
                    rows={3}
                    className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    The company sees your name, student ID, course and school. If they accept,
                    your coordinator places you; you are not placed automatically.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveListing(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Send application
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
