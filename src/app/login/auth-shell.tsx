import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  GraduationCap,
  School,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggleButton2 } from "@/components/v1/skiper4";
import { BackButton } from "./back-button";
import { SpatialShowcaseSlider } from "./spatial-showcase-card";

// Shared frame for Sign in and Create account. The two modes mirror each
// other so they never look identical: Sign in puts the brand panel on the
// left (55%), Create account puts it on the right (55%) and uses the extra
// room to explain the roles.
//
// Both panels use a strictly centered, constrained column:
// <div className="mx-auto w-full max-w-[480px] lg:max-w-[500px] px-6 lg:px-8">
// Symmetrical gutters on both sides at every breakpoint (375px, 768px, 1024px, 1440px).

const PANEL =
  "bg-foreground text-primary-foreground dark:bg-popover dark:border-border";

const TRUST = ["Verified schools", "Verified companies", "Audit-ready"];

const ROLES: { icon: LucideIcon; name: string; body: string }[] = [
  {
    icon: School,
    name: "School coordinator",
    body: "Upload your roster, approve hours and print reports.",
  },
  {
    icon: UserCheck,
    name: "Company supervisor",
    body: "Approve the hours of the students your company hosts.",
  },
  {
    icon: GraduationCap,
    name: "Student",
    body: "See your approved hours and the scope of work you agreed to.",
  },
  {
    icon: Building2,
    name: "Partner company",
    body: "Get verified and post openings with a clear scope of tasks.",
  },
];

function RoleCards() {
  return (
    <ul className="flex w-full flex-col gap-3.5 sm:gap-4" aria-label="User roles">
      {ROLES.map(({ icon: Icon, name, body }) => (
        <li
          key={name}
          className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.05] p-3.5 sm:p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/25 hover:bg-white/[0.08]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary-soft shadow-inner">
            <Icon className="size-5 sm:size-6" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-white tracking-tight">{name}</p>
            <p className="mt-0.5 text-xs sm:text-[13px] leading-relaxed text-white/70">
              {body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AuthShell({
  mode,
  children,
}: {
  mode: "signin" | "signup";
  children: ReactNode;
}) {
  const signup = mode === "signup";

  return (
    <div
      className={`grid min-h-screen lg:h-[100dvh] lg:overflow-hidden ${
        signup ? "lg:grid-cols-[45fr_55fr]" : "lg:grid-cols-[55fr_45fr]"
      }`}
    >
      {/* Brand panel: outer panel has NO horizontal padding; centered column carries px-6 lg:px-8 */}
      <aside
        className={`${PANEL} flex flex-col justify-between py-6 lg:py-8 lg:h-full lg:overflow-hidden ${
          signup ? "lg:order-2 lg:border-l" : "lg:border-r"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[484px] lg:max-w-[492px] flex-1 flex-col justify-between px-6 lg:px-8">
          {/* Top Row: Back button & Logo */}
          <div className="flex items-center gap-4 flex-nowrap shrink-0">
            <div className={signup ? "lg:hidden shrink-0" : "shrink-0"}>
              <BackButton variant="brand" />
            </div>

            <Link
              href="/"
              aria-label="Dugtong OJT home"
              className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:focus-visible:ring-offset-popover"
            >
              <Image
                src="/dugtong-logo-mark.png"
                alt="Dugtong"
                width={36}
                height={36}
                priority
                className="size-8 sm:size-9 object-contain shrink-0"
              />
              <span className="font-heading text-xl sm:text-[22px] font-bold tracking-tight text-white flex items-center gap-1.5">
                Dugtong
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  OJT
                </span>
              </span>
            </Link>
          </div>

          {/* Middle Content: Headline + Showcase or Role Cards (vertically centered in remaining space) */}
          <div className="my-auto flex w-full flex-col py-4 sm:py-6">
            <div>
              <h2 className="text-[clamp(2rem,3.2vw,2.75rem)] font-bold leading-[1.08] tracking-[-0.035em] text-white">
                {signup ? "One account. Four roles." : "Welcome to Dugtong."}
              </h2>
              <p className="mt-2.5 hidden max-w-[44ch] text-sm sm:text-base leading-relaxed text-primary-foreground/75 lg:block">
                {signup
                  ? "Create your account once. What you see after signing in depends on who you are."
                  : "One account for schools, students and companies."}
              </p>
            </div>

            <div className="mt-6 sm:mt-8 hidden lg:block">
              {signup ? <RoleCards /> : <SpatialShowcaseSlider />}
            </div>
          </div>

          {/* Bottom Trust Strip - horizontally centered */}
          <ul className="hidden w-full mx-auto flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-primary-foreground/60 lg:flex shrink-0 text-center">
            {TRUST.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    className="size-1 rounded-full bg-primary-foreground/40"
                    aria-hidden="true"
                  />
                )}
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form panel: outer panel has NO horizontal padding; centered column carries px-6 lg:px-8 */}
      <main
        className={`flex flex-col justify-between py-6 lg:py-8 lg:h-full lg:overflow-hidden bg-surface dark:bg-background ${
          signup ? "lg:order-1" : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-between px-6 lg:px-8">
          <div className="flex h-10 items-center justify-between shrink-0">
            {signup ? (
              <BackButton variant="surface" className="hidden lg:inline-flex" />
            ) : (
              <span />
            )}
            <ThemeToggleButton2 />
          </div>

          <div className="my-auto flex w-full flex-col justify-center gap-5 py-4 sm:gap-6">
            {children}
          </div>

          {/* Spacer to keep vertical centering balanced with top controls */}
          <div className="hidden lg:block h-10 shrink-0" aria-hidden="true" />
        </div>
      </main>
    </div>
  );
}
