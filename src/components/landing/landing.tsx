import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  History,
  Lock,
  School,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import type { PublicListing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { HeroMockup } from "./hero-mockup";
import { ProductShowcase } from "./product-showcase";
import { ParallaxWrap, RevealOnScroll } from "./scroll-reveal";

// Shared class strings, so every section lines up the same way.
const SECTION = "mx-auto w-full max-w-6xl px-4 py-16 lg:px-8 lg:py-24";
const EYEBROW =
  "text-xs font-medium uppercase tracking-[0.08em] text-teal-text";
const H2 =
  "mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl";
const CARD =
  "rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary-soft hover:bg-surface";
const TEXT_LINK =
  "inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const TRUST_STRIP = [
  "Verified schools",
  "Verified companies",
  "Built around the Data Privacy Act",
  "Audit-ready records",
];

// The stats are fictional samples; the footnote under the cards says so.
const AUDIENCES = [
  {
    icon: School,
    who: "School coordinators",
    body: "Upload your roster once. See who is waiting on approval and who is falling behind, then print each report when the hours are met.",
    stat: "24",
    statLabel: "students on one roster",
    href: "/login?mode=signup",
    link: "Set up your school",
  },
  {
    icon: GraduationCap,
    who: "Students",
    body: "Sign in with the email your school has on file. Watch approved hours add up, read the scope of work you agreed to, and speak up if the work changes.",
    stat: "486",
    statLabel: "required hours, BSIT",
    href: "/login",
    link: "Sign in to see your hours",
  },
  {
    icon: Building2,
    who: "Partner companies",
    body: "Get verified, post openings with a clear scope of tasks, and approve the hours of the students you host. Less paperwork on your side.",
    stat: "1",
    statLabel: "verified partner company",
    href: "/login?mode=signup",
    link: "Set up your company",
  },
];

const STEPS = [
  {
    title: "The day is logged",
    body: "Time in and time out go on record, one entry per day. Nothing waits for a signed paper slip.",
  },
  {
    title: "Someone who was there approves it",
    body: "The company supervisor approves or rejects. The coordinator can change any decision, and a rejected day goes back to be fixed.",
  },
  {
    title: "Approved hours add up",
    body: "Coordinators see every student's progress. When the hours are met, the report and certificate are one click.",
  },
];

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Verified before they start",
    body: "The Dugtong team checks every school and company before they can use the platform.",
  },
  {
    icon: UserCheck,
    title: "Only the right people see hours",
    body: "A student sees only their own hours, and only their own school sees them.",
  },
  {
    icon: Lock,
    title: "Documents stay private",
    body: "Company documents are stored privately and open through links that expire after 60 seconds.",
  },
  {
    icon: History,
    title: "A history nobody can edit",
    body: "Every approval and rejection is written down with who decided and when.",
  },
];

// Shown only when the real list is empty, and labelled as samples.
const SAMPLE_OPENINGS = [
  {
    title: "Web development intern",
    company: "Iloilo IT Solutions Inc.",
    city: "Iloilo City",
    course: "BSIT",
    hours: 486,
  },
  {
    title: "HR assistant intern",
    company: "Iloilo IT Solutions Inc.",
    city: "Iloilo City",
    course: "BSHRM",
    hours: 240,
  },
];

function OpeningMeta({ course, hours }: { course: string; hours: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="verified">
        <ShieldCheck className="size-3" aria-hidden="true" />
        Verified company
      </Badge>
      <Badge variant="secondary">{course}</Badge>
      <Badge variant="secondary" className="font-mono tabular-nums">
        {hours} hrs
      </Badge>
    </div>
  );
}

// What anyone sees at the front door when they are not signed in.
export async function Landing() {
  // The openings are the real public list, the same one /listings shows.
  const supabase = await createClient();
  const { data } = await supabase
    .from("public_listings")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(3);
  const openings = (data ?? []) as PublicListing[];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1">
        {/* 2. Hero */}
        <section className="relative overflow-hidden">
          {/* Atmosphere: one soft tint in the top-left corner, under 8% */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_8%_0%,var(--color-primary-soft),transparent_70%)] opacity-[0.08]"
          />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-teal-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-teal-text">
                <span
                  className="size-1.5 rounded-full bg-teal"
                  aria-hidden="true"
                />
                For Philippine schools and companies
              </p>
              <h1 className="mt-6 text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-foreground">
                Track OJT hours without the paperwork.
              </h1>
              <p className="mt-6 max-w-[48ch] text-base leading-[1.6] text-muted-foreground sm:text-lg">
                Every day is logged, approved by someone who was there, and
                kept on record. Reports and certificates take one click.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login?mode=signup"
                  className={buttonVariants({ size: "lg" })}
                >
                  Create an account
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Sign in
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Looking for a place to do your OJT?{" "}
                <Link
                  href="/listings"
                  className="rounded-sm font-medium text-primary-text underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Browse OJT openings
                </Link>
                . No account needed.
              </p>
            </div>

            <ParallaxWrap>
              <HeroMockup />
            </ParallaxWrap>
          </div>
        </section>

        {/* 3. Trust strip */}
        <section
          aria-label="Why people trust Dugtong"
          className="border-y border-border bg-surface"
        >
          <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-5 text-xs text-muted-foreground lg:px-8">
            {TRUST_STRIP.map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    className="size-1 rounded-full bg-muted-foreground/50"
                    aria-hidden="true"
                  />
                )}
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Who uses Dugtong */}
        <section aria-labelledby="who-heading" className={SECTION}>
          <RevealOnScroll>
            <p className={EYEBROW}>Built for each role</p>
            <h2 id="who-heading" className={H2}>
              Who uses Dugtong
            </h2>
            <p className="mt-3 max-w-[56ch] text-base leading-[1.6] text-muted-foreground">
              One system, three views. Everyone sees what they need, and
              nothing more.
            </p>
          </RevealOnScroll>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <li key={a.who} className="flex">
                <RevealOnScroll className="flex w-full">
                  <div className={`${CARD} flex w-full flex-col gap-4 p-6`}>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-teal-bg text-teal-text">
                      <a.icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg text-foreground">{a.who}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {a.body}
                    </p>
                    <div className="mt-auto flex items-baseline gap-2 border-t border-border pt-4">
                      <span className="font-heading text-2xl font-medium tabular-nums text-foreground">
                        {a.stat}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {a.statLabel}
                      </span>
                    </div>
                    <Link href={a.href} className={TEXT_LINK}>
                      {a.link}
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Figures are fictional samples of how Dugtong looks in use.
          </p>
        </section>

        {/* 5. How an hour gets approved */}
        <section
          aria-labelledby="how-heading"
          className="border-y border-border bg-surface"
        >
          <div className={SECTION}>
            <RevealOnScroll>
              <p className={EYEBROW}>How it works</p>
              <h2 id="how-heading" className={H2}>
                How an hour gets approved
              </h2>
            </RevealOnScroll>

            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative pl-14 md:pl-0">
                  <RevealOnScroll>
                    <span
                      className="absolute left-0 top-0 flex size-9 items-center justify-center rounded-full bg-primary font-mono text-sm font-medium text-primary-foreground md:static md:mb-5"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <h3 className="text-lg text-foreground">{s.title}</h3>
                    <p className="mt-2 max-w-[40ch] text-sm leading-6 text-muted-foreground">
                      {s.body}
                    </p>
                  </RevealOnScroll>
                  {i < STEPS.length - 1 && (
                    <>
                      {/* Track: vertical on phones, horizontal from md */}
                      <span
                        className="absolute left-[17px] top-11 -bottom-10 w-px bg-border md:hidden"
                        aria-hidden="true"
                      />
                      <span
                        className="absolute left-12 top-[17px] hidden h-px w-[calc(100%-3rem+2rem)] bg-border md:block"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6. Why the records can be trusted */}
        <section aria-labelledby="trust-heading" className={SECTION}>
          <RevealOnScroll>
            <p className={EYEBROW}>Trust and privacy</p>
            <h2 id="trust-heading" className={H2}>
              Why the records can be trusted
            </h2>
          </RevealOnScroll>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {TRUST.map((t) => (
              <li key={t.title}>
                <RevealOnScroll className="h-full">
                  <div className={`${CARD} flex h-full gap-4 p-6`}>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-bg text-teal-text">
                      <t.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg text-foreground">{t.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {t.body}
                      </p>
                    </div>
                  </div>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
        </section>

        {/* 7. Product preview */}
        <section
          aria-labelledby="preview-heading"
          className="border-y border-border bg-surface"
        >
          <div className={SECTION}>
            <RevealOnScroll className="mx-auto max-w-2xl text-center">
              <p className={EYEBROW}>Inside Dugtong</p>
              <h2 id="preview-heading" className={H2}>
                Everything a coordinator needs, on one screen
              </h2>
              <p className="mt-3 text-base leading-[1.6] text-muted-foreground">
                Progress, approvals and partners in a calm view that does not
                need a spreadsheet beside it.
              </p>
            </RevealOnScroll>
            <RevealOnScroll className="mt-12">
              <ProductShowcase />
            </RevealOnScroll>
          </div>
        </section>

        {/* 8. Open now */}
        <section aria-labelledby="open-heading" className={SECTION}>
          <RevealOnScroll className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={EYEBROW}>OJT openings</p>
              <h2 id="open-heading" className={H2}>
                Open now
              </h2>
            </div>
            <Link href="/listings" className={TEXT_LINK}>
              See all openings
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </RevealOnScroll>

          <ul className="mt-10 flex flex-col gap-4">
            {openings.length > 0
              ? openings.map((o) => (
                  <li key={o.id}>
                    <Link
                      href="/listings"
                      className={`${CARD} flex flex-col gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-row sm:items-center sm:justify-between sm:p-6`}
                    >
                      <div className="min-w-0">
                        <p className="font-heading text-xl font-medium tracking-[-0.01em] text-foreground">
                          {o.role_title ?? o.course}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {o.company_name} · {o.city}
                        </p>
                      </div>
                      <OpeningMeta
                        course={o.course}
                        hours={o.required_hours}
                      />
                    </Link>
                  </li>
                ))
              : SAMPLE_OPENINGS.map((o) => (
                  <li
                    key={o.title}
                    className={`${CARD} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading text-xl font-medium tracking-[-0.01em] text-foreground">
                          {o.title}
                        </p>
                        <Badge variant="secondary">Sample</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {o.company} · {o.city}
                      </p>
                    </div>
                    <OpeningMeta course={o.course} hours={o.hours} />
                  </li>
                ))}
          </ul>
          {openings.length === 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              No openings are posted yet, so these are samples. Verified
              companies post real ones here.
            </p>
          )}
        </section>

        {/* 9. Final CTA */}
        <section
          aria-labelledby="cta-heading"
          className="border-t border-border bg-surface"
        >
          <RevealOnScroll className="mx-auto w-full max-w-3xl px-4 py-16 text-center lg:py-24">
            <h2
              id="cta-heading"
              className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground"
            >
              Ready to remove the paperwork?
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-base leading-[1.6] text-muted-foreground sm:text-lg">
              Set up your school or company in minutes, and give your students
              a clearer way through OJT.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login?mode=signup"
                className={buttonVariants({ size: "lg" })}
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Sign in
              </Link>
            </div>
          </RevealOnScroll>
        </section>
      </main>

      {/* 10. Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-10 lg:px-8">
          <Link
            href="/"
            aria-label="Dugtong OJT home"
            className="flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Image
              src="/dugtong-ojt-logo.png"
              alt="Dugtong OJT"
              width={260}
              height={70}
              className="dugtong-logo-light h-auto w-32"
            />
            <Image
              src="/dugtong-ojt-logo-dark.png"
              alt="Dugtong OJT"
              width={260}
              height={70}
              className="dugtong-logo-dark h-auto w-32"
            />
          </Link>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            {[
              ["/listings", "OJT openings"],
              ["/login", "Sign in"],
              ["/login?mode=signup", "Create account"],
              ["/privacy", "Privacy"],
              ["/terms", "Terms"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="w-full border-t border-border pt-6 text-xs leading-5 text-muted-foreground">
            Student records are used only for OJT. Built at the PHINMA AI
            Builder Workshop.
          </p>
        </div>
      </footer>
    </div>
  );
}
