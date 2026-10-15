import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PublicHeader } from "@/components/public-header";
import type { PublicListing } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { DtrSample } from "./dtr-sample";

const AUDIENCES = [
  {
    who: "School coordinators",
    body: "Upload your roster once. See who is waiting for approval and who is behind, and print each student's report when the hours are met.",
    href: "/login?mode=signup",
    link: "Set up your school",
  },
  {
    who: "Students",
    body: "Sign in with the email your school has on file. Log each day from your phone, watch approved hours add up, and report a problem if the work is not what was agreed.",
    href: "/login",
    link: "Sign in to log hours",
  },
  {
    who: "Partner companies",
    body: "Get verified, post openings with a clear scope of tasks, and approve the hours of the students you host.",
    href: "/login?mode=signup",
    link: "Set up your company",
  },
];

const STEPS = [
  {
    title: "A student logs the day",
    body: "Time in and time out, from a phone, for today or the last 30 days. One entry per day.",
  },
  {
    title: "Someone who was there approves it",
    body: "The company supervisor approves or rejects. The school coordinator can change any decision. A rejected day goes back to the student to fix.",
  },
  {
    title: "Approved hours add up",
    body: "The coordinator sees every student's progress. When the required hours are met, the report and the completion certificate are one click.",
  },
];

const TRUST = [
  "Schools and companies are verified by the Dugtong team before they can use it.",
  "A student sees only their own hours, and only their own school sees them.",
  "Company documents are stored privately and open through links that expire after 60 seconds.",
  "Every approval and rejection goes into a history nobody can edit.",
];

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
        {/* Hero: what it is, and what it looks like */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <h1 className="text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-[56px]">
              Track OJT hours without the paperwork.
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Students log each day. The company supervisor or the school
              coordinator approves it. When the required hours are met, the
              report and certificate are one click away.
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
            <p className="mt-5 text-sm text-muted-foreground">
              Looking for a place to do your OJT?{" "}
              <Link
                href="/listings"
                className="font-medium text-primary-text underline underline-offset-4"
              >
                Browse OJT openings
              </Link>
              . No account needed.
            </p>
          </div>

          <DtrSample />
        </section>

        {/* Who it is for: three columns divided by rules, not three cards */}
        <section
          aria-labelledby="who-heading"
          className="border-y border-border bg-surface"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-14 lg:px-8">
            <h2 id="who-heading" className="text-2xl text-foreground sm:text-[28px]">
              Who uses Dugtong
            </h2>
            <div className="mt-8 grid gap-0 md:grid-cols-3">
              {AUDIENCES.map((a, i) => (
                <div
                  key={a.who}
                  className={`flex flex-col gap-3 py-6 md:py-0 ${i > 0 ? "border-t border-border md:border-l md:border-t-0 md:pl-8" : ""} ${i < AUDIENCES.length - 1 ? "md:pr-8" : ""}`}
                >
                  <h3 className="text-lg text-foreground">{a.who}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{a.body}</p>
                  <Link
                    href={a.href}
                    className="mt-auto pt-1 text-sm font-medium text-primary-text underline-offset-4 hover:underline"
                  >
                    {a.link}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How an hour gets approved: a real sequence, so it is numbered */}
        <section
          aria-labelledby="how-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-8"
        >
          <h2 id="how-heading" className="text-2xl text-foreground sm:text-[28px]">
            How an hour gets approved
          </h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex flex-col gap-3">
                <span
                  className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute left-10 top-4 hidden h-px w-[calc(100%-2.5rem+2rem)] bg-border md:block"
                    aria-hidden="true"
                  />
                )}
                <h3 className="text-lg text-foreground">{s.title}</h3>
                <p className="max-w-[40ch] text-sm leading-6 text-muted-foreground">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Why the records can be trusted */}
        <section
          aria-labelledby="trust-heading"
          className="border-y border-border bg-surface"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:px-8">
            <h2 id="trust-heading" className="text-2xl text-foreground sm:text-[28px]">
              Why the records can be trusted
            </h2>
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {TRUST.map((t) => (
                <li key={t} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-teal-text"
                    aria-hidden="true"
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What is open right now: real listings, or an invitation */}
        <section
          aria-labelledby="open-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 lg:px-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="open-heading" className="text-2xl text-foreground sm:text-[28px]">
              Open now
            </h2>
            {openings.length > 0 && (
              <Link
                href="/listings"
                className="text-sm font-medium text-primary-text underline-offset-4 hover:underline"
              >
                See all openings
              </Link>
            )}
          </div>

          {openings.length === 0 ? (
            <p className="mt-6 max-w-[56ch] text-sm leading-6 text-muted-foreground">
              No openings are posted yet. Verified companies post them here.{" "}
              <Link
                href="/login?mode=signup"
                className="font-medium text-primary-text underline underline-offset-4"
              >
                Set up a company account
              </Link>{" "}
              to post the first one.
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {openings.map((o) => (
                <li key={o.id}>
                  <Link
                    href="/listings"
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4 transition-colors hover:bg-surface-hover sm:px-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {o.role_title ?? o.course}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {o.company_name} · {o.city}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="verified">Verified company</Badge>
                      <span>{o.course}</span>
                      <span className="font-mono text-xs tabular-nums">
                        {o.required_hours} hours
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/dugtong-ojt-logo.png"
              alt="Dugtong OJT"
              width={260}
              height={70}
              className="dugtong-logo-light h-auto w-28"
            />
            <Image
              src="/dugtong-ojt-logo-dark.png"
              alt="Dugtong OJT"
              width={260}
              height={70}
              className="dugtong-logo-dark h-auto w-28"
            />
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <Link href="/listings" className="hover:text-foreground">OJT openings</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/login?mode=signup" className="hover:text-foreground">Create account</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </nav>
          <p className="w-full text-xs leading-5 text-muted-foreground">
            Student records are used only for OJT. Built at the PHINMA AI Builder Workshop.
          </p>
        </div>
      </footer>
    </div>
  );
}
