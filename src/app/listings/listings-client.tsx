"use client";

import { useState } from "react";
import { Button, ListingCard, Modal } from "@/components/ui";
import { Search, CheckCircle2, Briefcase } from "lucide-react";

export type ListingItem = {
  id: string;
  title: string;
  companyName: string;
  location: string;
  workSetup: "On site" | "Hybrid" | "Remote";
  isVerified: boolean;
  requiredCourse: string;
  targetHours: number;
  slotsRemaining: number;
  description?: string;
};

const DEFAULT_LISTINGS: ListingItem[] = [
  {
    id: "l-1",
    title: "Web Development Intern",
    companyName: "Iloilo IT Solutions Inc.",
    location: "Iloilo City",
    workSetup: "Hybrid",
    isVerified: true,
    requiredCourse: "BSIT / BSCS",
    targetHours: 486,
    slotsRemaining: 3,
    description: "Build client dashboards, develop RESTful API integrations, and participate in daily agile standups.",
  },
  {
    id: "l-2",
    title: "Quality Assurance & Testing Intern",
    companyName: "Panay Care BPO",
    location: "Mandurriao, Iloilo",
    workSetup: "On site",
    isVerified: true,
    requiredCourse: "BSIT / BSIS",
    targetHours: 400,
    slotsRemaining: 4,
    description: "Write automated Cypress test suites, execute regression test runs, and log Jira bug reports.",
  },
  {
    id: "l-3",
    title: "Digital Marketing & Content Intern",
    companyName: "Visayas EduTech",
    location: "Bacolod City",
    workSetup: "Remote",
    isVerified: true,
    requiredCourse: "BSBA / Multimedia",
    targetHours: 300,
    slotsRemaining: 2,
    description: "Create educational social collateral, optimize landing page SEO copy, and track lead conversion funnels.",
  },
  {
    id: "l-4",
    title: "IT Support & Network Operations",
    companyName: "QuickServe Staffing",
    location: "Iloilo City",
    workSetup: "On site",
    isVerified: true,
    requiredCourse: "BSIT / BSCpE",
    targetHours: 486,
    slotsRemaining: 5,
    description: "Configure office workstations, manage VLAN access switches, and provide Tier-1 helpdesk support.",
  },
  {
    id: "l-5",
    title: "Frontend UI/UX Engineering Intern",
    companyName: "TechAdvance PH",
    location: "Iloilo City",
    workSetup: "Hybrid",
    isVerified: true,
    requiredCourse: "BSIT / BSCS",
    targetHours: 240,
    slotsRemaining: 2,
    description: "Implement design system components using Tailwind CSS, Figma token handoffs, and Next.js App Router.",
  },
  {
    id: "l-6",
    title: "HR & Recruitment Coordinator Intern",
    companyName: "Iloilo Digital Hub",
    location: "Jaro, Iloilo",
    workSetup: "On site",
    isVerified: true,
    requiredCourse: "BS Psychology / BSBA",
    targetHours: 300,
    slotsRemaining: 3,
    description: "Screen intern applications, schedule interviews, and organize orientation onboarding packets.",
  },
];

export function ListingsClient({
  initialListings = DEFAULT_LISTINGS,
}: {
  initialListings?: ListingItem[];
}) {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [setupFilter, setSetupFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [activeListing, setActiveListing] = useState<ListingItem | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = initialListings.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.companyName.toLowerCase().includes(q) ||
      item.requiredCourse.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);

    const matchesCourse =
      courseFilter === "all" ||
      item.requiredCourse.toLowerCase().includes(courseFilter.toLowerCase());

    const matchesSetup =
      setupFilter === "all" || item.workSetup === setupFilter;

    const matchesLocation =
      locationFilter === "all" ||
      item.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesCourse && matchesSetup && matchesLocation;
  });

  const handleOpenApply = (listing: ListingItem) => {
    setActiveListing(listing);
    setCoverNote("");
    setApplyModalOpen(true);
  };

  const handleConfirmApply = () => {
    if (!activeListing) return;
    setApplyModalOpen(false);
    setToastMessage(
      `Application submitted for ${activeListing.title} at ${activeListing.companyName}!`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-[10px] border border-border border-l-4 border-l-primary bg-card p-3 shadow-lg text-sm text-foreground flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toastMessage}</span>
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
              className="rounded-[8px] border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All courses</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCS">BSCS</option>
              <option value="BSBA">BSBA</option>
              <option value="BSIS">BSIS</option>
              <option value="Psychology">BS Psychology</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-[8px] border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All locations</option>
              <option value="Iloilo">Iloilo City</option>
              <option value="Mandurriao">Mandurriao</option>
              <option value="Bacolod">Bacolod City</option>
              <option value="Jaro">Jaro</option>
            </select>

            <select
              value={setupFilter}
              onChange={(e) => setSetupFilter(e.target.value)}
              className="rounded-[8px] border border-border bg-card px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">Work setup</option>
              <option value="On site">On site</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="mx-auto w-full max-w-[1200px] px-4 py-8 lg:px-8">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> verified opening{filtered.length === 1 ? "" : "s"}
          </span>
          {(search || courseFilter !== "all" || setupFilter !== "all" || locationFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCourseFilter("all");
                setSetupFilter("all");
                setLocationFilter("all");
              }}
              className="text-primary hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[12px] border border-border bg-card p-12 text-center">
            <Briefcase className="size-8 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground">No openings match your search</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try broadening your course or location filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                companyName={item.companyName}
                location={item.location}
                workSetup={item.workSetup}
                isVerified={item.isVerified}
                requiredCourse={item.requiredCourse}
                targetHours={item.targetHours}
                slotsRemaining={item.slotsRemaining}
                onApply={() => handleOpenApply(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Application Modal */}
      {activeListing && (
        <Modal
          open={applyModalOpen}
          onOpenChange={setApplyModalOpen}
          title={`Apply for ${activeListing.title}`}
          description={`Submit your application to ${activeListing.companyName}.`}
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="rounded-[8px] bg-surface p-3 text-xs flex flex-col gap-1.5 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Hours:</span>
                <span className="font-mono font-medium text-foreground">{activeListing.targetHours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Course:</span>
                <span className="font-medium text-foreground">{activeListing.requiredCourse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Work Setup:</span>
                <span className="font-medium text-foreground">{activeListing.workSetup} ({activeListing.location})</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Note to coordinator & supervisor (optional)
              </label>
              <textarea
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Briefly state your relevant subjects, technical interests, or schedule availability"
                rows={3}
                className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmApply}
              >
                Submit application
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
