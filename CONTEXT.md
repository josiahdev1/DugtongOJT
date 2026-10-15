# Dugtong OJT — Unified Project Context

> Consolidated product, workshop, technical, role-ownership, design-system, security, and Git guidance for the shared project laptop. Read the root `CLAUDE.md`, this file, the approved `docs/SPEC.md`, and the active ticket before feature work. This file does not override `CLAUDE.md` or team-approved specs.

**Product:** Dugtong OJT

**Type:** Multi-tenant SaaS + marketplace

**Market:** Philippine colleges, universities, and technical schools with OJT requirements

**Team:** Neil Mar (UI/UX and frontend), Khent (security/accounts/student protection), Josiah (marketplace/evaluations/admin dashboard), Arwin (school-side OJT tracking)

**Hackathon:** [Event Name]

**Date:** October 14, 2026

**Unified context consolidated:** October 15, 2026

# PHINMA AI Builder Workshop — Project Rules

These rules govern how the team and coding agents build, change, test, and ship Dugtong OJT. Read them before implementation. If a rule conflicts with a suggested shortcut, follow these rules and explain the blocker plainly.

## Pinned stack — do not change

- **Frontend:** Next.js App Router, React, and TypeScript, using the versions already installed in the repository (the documented target is Next.js 15 and React 19).
- **Styling:** the existing Tailwind CSS setup and the design tokens in Section 10 of this unified context.
- **UI components:** reuse the existing shadcn/ui components in `src/components/ui/`. Extend them consistently; do not introduce a second component or CSS library.
- **Backend:** the existing **hosted Supabase project only** for database, authentication, and storage where configured. Never run Supabase locally.
- **Hosting:** Vercel. Every push to `main` deploys production; only the team leader manages `main` and production merges.
- **Environment:** never require Docker. Do not introduce another framework, database, hosting provider, CSS library, or paid service. If the project genuinely needs something outside this stack, stop, explain the need in plain English, and wait for team approval.

## The five workshop rules

1. **Deploy first.** Confirm the existing app is live on Vercel before feature work. After each completed ticket, commit and push only according to Section 14, then have the team open the available live/preview URL. Neil must never push to `main`; if production deployment or first-time setup requires a `main` operation, report it to the team leader.
2. **No spec, no feature code.** Before implementing a feature, check whether `docs/SPEC.md` exists. If it does not, do not write feature code. Tell the team to run `/grill-with-docs`, then `/to-spec`. Repository inspection and documentation needed to identify this blocker are allowed.
3. **MVP discipline.** Implement the one user type and one core job defined by the approved `docs/SPEC.md`; aim for a demoable flow of about three minutes. Do not expand scope silently. Suggest recording additional ideas in `docs/LATER.md` and wait for approval before adding them.
4. **Security baseline — mandatory even for demos.** RLS must be enabled with explicit policies on every Supabase table. Never disable, weaken, or bypass RLS. No Supabase `service_role` key or `sb_secret_` key may be added to source files or exposed to the browser. Only the Supabase URL and publishable/anon key may use `NEXT_PUBLIC_` variables. Never commit `.env.local`; never expose secrets in client code.
5. **Teach as you go.** After each change, explain in two or three plain-English sentences what changed and why. Define technical jargon the first time it appears. Keep the tone respectful and make it safe for beginners to ask questions.

## Working with this team

- Many contributors use Windows. Give commands that work in PowerShell and Git Bash; prefer existing `npm run` scripts over shell-specific tricks.
- If the same error occurs twice, stop. Explain what was tried and the likely cause; do not attempt a third variation without discussing the issue.
- Finish one ticket, report what changed and how it was checked, then wait unless the team explicitly asks you to continue.
- `npm audit` may report issues in the ESLint development toolchain. Do not run an automatic audit fix that downgrades the project. Explain the finding and leave it unchanged unless the team specifically authorizes a safe fix.

## Required project workflow

| Step | Command | Expected output |
|---|---|---|
| Stress-test the problem | `/grill-with-docs` | `docs/PROBLEM.md` |
| Prepare the Session 1 pitch | `/pitch` | `docs/PITCH.md` |
| Write the spec | `/to-spec` | `docs/SPEC.md` |
| Break work into tickets | `/to-tickets` | `docs/tickets/NN-*.md` |
| Build one ticket | `/implement` | Code, commit, and available live/preview verification |
| Review | `/code-review` | Review report |

Do not assume these slash commands are available as shell commands. Use them through the team's configured agent/workflow interface. If unavailable, tell the team rather than inventing a command-line equivalent.

## Project locations

- `docs/PROBLEM.md` — problem, target person, and MVP cut
- `docs/PITCH.md` — three-minute pitch
- `docs/SPEC.md` — approved product scope and acceptance criteria
- `docs/tickets/` — one file per implementation ticket
- `docs/LATER.md` — approved parking lot for non-MVP ideas
- `supabase/sql/` — numbered SQL changes when database work is explicitly authorized
- `src/components/ui/` — existing shared shadcn/ui building blocks
- `src/lib/supabase/` — existing Supabase clients and usage guidance

Inspect the actual repository before assuming any path exists or editing files. These paths describe the expected project layout; the checked-out repository is the final source of truth.

---

## Table of Contents

1. [What We Are Building](#1-what-we-are-building)
2. [The Problem](#2-the-problem)
3. [The Solution](#3-the-solution)
4. [Who Uses It](#4-who-uses-it)
5. [How It Works — End to End](#5-how-it-works--end-to-end)
6. [Business Model](#6-business-model)
7. [Go-to-Market Strategy](#7-go-to-market-strategy)
8. [Competitive Advantage](#8-competitive-advantage)
9. [Technical Architecture](#9-technical-architecture)
10. [Design System and Frontend Standards](#10-design-system-and-frontend-standards)
11. [What Makes This a SaaS](#11-what-makes-this-a-saas-not-a-school-tool)
12. [Team Ownership, Handoffs, and Open Decisions](#12-team-ownership-handoffs-and-open-decisions)
13. [Repository Structure and Agent Rules](#13-repository-structure-and-agent-rules)
14. [Contributor Git Workflow — Neil](#14-contributor-git-workflow--neil)
15. [Agent Confirmation Rules](#15-agent-confirmation-rules--always-ask-before-acting)

---

## 1. What We Are Building

Dugtong OJT is an **On-the-Job Training management platform** with a **built-in marketplace** that connects Philippine schools to verified partner companies.

It has two layers:

1. **Marketplace** — where verified companies post OJT slots and schools request partnerships
2. **Management tool** — where schools track student hours, journals, evaluations, and MOAs from a single dashboard

Schools pay for the management tool. Companies and students use it free.

**One-line pitch:** The OJT management system for Philippine schools, with a built-in marketplace to find verified partner companies.

---

## 2. The Problem

OJT placement in the Philippines runs on personal connections, paper MOAs, and spreadsheets. Nothing connects schools, companies, and students in one system.

### 2.1 Schools

- Coordinators search for partner companies through personal contacts and cold emails
- MOAs live on paper and expire unnoticed
- Tracking hours, journals, and evaluations for hundreds of students is manual

### 2.2 Companies

- No single place to announce OJT slots or find partner schools by course and required hours
- Admin work for endorsements, reports, and evaluations falls on supervisors

### 2.3 Students

- Depend on whatever their school or relatives can arrange
- Listings are hard to find
- Little recourse when a company assigns work outside the agreed scope

### 2.4 The Result

- Placements go to students with connections
- Coordinators spend weeks on paperwork instead of supporting students
- Misuse of interns goes unreported

> Open item (from the proposal): add one or two real numbers before submission, such as a pilot school's OJT headcount or hours a coordinator spends on paperwork per term. A short survey of two or three coordinators is enough.

---

## 3. The Solution

Dugtong has two layers — a marketplace that fills the pipeline and a management tool schools rely on every day — supported by a protection and trust layer:

### 3.1 Marketplace (the connector)

- Verified companies post OJT opportunities with defined scope of work
- Schools post requests for companies that can host their students
- Either side can send a partnership request
- Students can browse listings without an account

### 3.2 Management Tool (the product schools pay for)

- Once a partnership is agreed, the school uploads students by CSV or Excel
- Deploys them to the company
- Monitors attendance, journals, hours, and evaluations until completion
- Generates the final evaluation report and completion certificate (MVP); digital MOA management is a Next-stage feature

### 3.3 Protection and Trust Layer

- Scope-of-work acknowledgment (student confirms what they agreed to)
- Report and appeal channel (student flags out-of-scope work)
- Company trust scores (evaluations, completion rates, upheld reports)

**The marketplace brings schools in. The management tool keeps them subscribed** — because a school's OJT records, agreements, and evaluations accumulate in Dugtong semester after semester.

---

## 4. Who Uses It

Four roles, one system, different views.

### 4.1 Coordinator (school)

**Who:** OJT Coordinator at a college, university, or technical school

**Paid user:** Yes — this is the paying customer

**What they do:**

- Manage student list (upload via CSV/Excel)
- Request partnerships with companies
- Track student hours and attendance
- Approve student journals (see Section 12.4 — the proposal assigns journal sign-off to supervisors)
- Generate evaluation reports
- Track MOA expiry (Next stage)
- Prepare accreditation reports (Later stage, paid add-on)

**Why they stay:** Every semester adds attendance records, signed MOAs, evaluations, and audit history. Leaving Dugtong means losing that history.

### 4.2 Supervisor (company)

**Who:** HR staff or team lead at a partner company

**Paid user:** No — free, with optional paid upgrades later

**What they do:**

- Post OJT listings with defined scope of work
- Accept or decline partnership requests
- View assigned students
- Log attendance
- Submit evaluations
- See their trust score

**Why they use it:** Less admin work, and a trust score that signals reliability to schools.

### 4.3 Student

**Who:** College student completing required OJT hours

**Paid user:** No — free

**What they do:**

- Browse listings without an account
- Acknowledge scope of work on acceptance
- Submit weekly journals (Next stage) and log hours (see Section 12.4 for the attendance conflict)
- View evaluation results
- Report out-of-scope work or unsafe conditions

**Why they use it:** Easy-to-find placements and protection from misuse.

### 4.4 Admin (Dugtong)

**Who:** Platform staff

**What they do:**

- Verify schools and companies before account creation
- Review flagged reports and appeals
- Monitor platform metrics
- Manage trust scores
- Suspend companies with repeated upheld reports

---

## 5. How It Works — End to End

### 5.1 Company Posts a Listing

1. Company signs up and uploads verification documents (DTI/SEC, mayor's permit, authorized rep)
2. Admin reviews and approves
3. Company posts a listing with:
   - Course
   - Number of students (slots)
   - Required hours
   - Schedule and hours per day
   - Defined scope of tasks
   - (Role title and location/work setup are not specified in the proposal; confirm with Josiah before adding them.)
4. Listing goes live and is visible to students without an account

### 5.2 School Requests Partnership

1. Coordinator browses the marketplace, or posts a school partner request for companies that can host students from a given program
2. Finds a listing that matches their students' courses and required hours
3. Sends a partnership request (companies may also send a request to a school; either side can start)
4. The receiving party sees the request (notifications are a later feature)
5. The receiving party accepts → partnership created, or declines

### 5.3 School Deploys Students

1. Coordinator uploads students via CSV or Excel
2. System validates the file (column mapping, error check)
3. Coordinator assigns students to the company
4. Students receive email or student ID invite
5. Students log in and see their deployment

### 5.4 Student Completes OJT

1. Student sees their deployment, scope of work, and hours progress
2. Student acknowledges scope of work on first login
3. Daily: time-in and time-out are recorded with supervisor approval (MVP; see Section 12.4). Weekly: student submits a journal (accomplishment report) — Next stage
4. Coordinator reviews and approves journals
5. Supervisor logs attendance and submits evaluations
6. System tracks everything in real time

### 5.5 Student Protection

1. Every listing has a defined scope of work
2. Student acknowledges the scope when accepting placement
3. Student can file a report for out-of-scope work, unsafe conditions, or unrecorded overtime
4. Every report requires a short description and a related task or date
5. Report goes to the school coordinator first, who reviews it before any company-level action
6. If the coordinator cannot resolve it, or the same company is flagged repeatedly, it escalates to Dugtong admin
7. Upheld reports feed the company's trust score
8. Companies with repeated upheld reports can be suspended from posting

### 5.6 School Generates Reports

1. At any point, coordinator can generate:
   - Student hours report (MVP, from attendance)
   - Final evaluation report and completion certificate (MVP)
   - Compliance view: students behind on hours, missing documents, or unassigned (Next)
   - MOA status report (Next, with digital MOA management)
   - Accreditation and audit exports (Later, paid add-on)
2. Reports are exportable and audit-ready

### 5.7 Company Builds Trust

1. Every completed student adds to the company's trust score
2. Trust score factors:
   - Completion rate
   - Evaluations
   - Upheld reports (negative)
3. Schools see the trust score before approving a partnership
4. Higher trust = more partnership requests

---

## 6. Business Model

**Schools pay. Students and companies join free.**

### 6.1 Pricing

| Product | Buyer | Model | Timing |
|---------|-------|-------|--------|
| OJT Management Subscription | Schools | Per-student per semester (₱150) or tiered annual | Launch |
| Accreditation and Audit Reports | Schools | Add-on (₱15,000/year) | 6–12 months |
| Verified Company Badge and priority placement | Companies | Annual fee (₱3,000) | 6–12 months |
| Talent Pipeline Access | Companies | Subscription or per-hire (₱25,000/year) | Year 2 |
| Premium Company Tools | Larger companies | Subscription | Year 2 |
| Alumni Portfolio | Students | Low-cost add-on | Later |

**Always free:** Student browsing and applying, company listings, school partner requests.

**Pricing promotions:** a free pilot for one department or batch, a discount for annual prepayment, and a founding-school rate for the first schools that sign up.

### 6.2 Revenue Projection

| | Year 1 | Year 2 | Year 3 |
|--|--------|--------|--------|
| Paying schools | 5 | 20 | 50 |
| Students deployed (400 per school) | 2,000 | 8,000 | 20,000 |
| Management subscription (₱150 × students) | ₱300,000 | ₱1,200,000 | ₱3,000,000 |
| Accreditation add-on (₱15,000 × schools) | none | ₱300,000 | ₱750,000 |
| Verified badges (100, then 300 companies × ₱3,000) | none | ₱300,000 | ₱900,000 |
| Talent pipeline (30 companies × ₱25,000 in Year 3) | none | none | ₱750,000 |
| **Total revenue** | **₱300,000** | **₱1,800,000** | **₱5,400,000** |

All figures are planning assumptions, not market data, and should be replaced with pilot results. The subscription line assumes one paid OJT term per deployed student per year. Talent pipeline revenue is counted only from Year 3 because it needs a pool of evaluated alumni first, even though the product is listed for Year 2. Costs (hosting, verification staff, support, sales) are not yet modeled; add a simple cost line and break-even point before presenting. Do not invent these figures in code or marketing copy.

### 6.3 Why Schools Renew

Each semester adds:

- Attendance records
- Signed MOAs
- Evaluations
- Audit history

Leaving Dugtong means losing that history and rebuilding the paperwork. Retention grows with use.

### 6.4 Why We Don't Copy LinkedIn

LinkedIn works because recruiters pay for access to a huge talent pool. OJT students are short-term and unpaid, so companies won't pay for access at the start. Company revenue becomes realistic only after we hold a pool of evaluated alumni.

---

## 7. Go-to-Market Strategy

### 7.1 Start with Schools

We avoid the marketplace cold-start problem by starting with schools, who bring their own students and partner companies.

### 7.2 Six Steps

1. **Pilot with one school or department.** Free pilot for one batch of OJT students.
2. **Onboard partner companies through the school.** Companies the school already works with are invited to verify and join free.
3. **Prove value with one cycle.** Measure hours saved, records completed, time to generate final reports.
4. **Convert to paid.** Move school to per-student or annual plan, with founding-school discount.
5. **Grow by referral.** Coordinators talk to each other. Use pilot results to approach neighboring schools.
6. **Add company revenue later.** Verified badges once schools request partnerships, talent access once evaluated alumni exist.

### 7.3 Starting Market

Schools and employers in Western Visayas, beginning with one pilot school, then expanding to nearby schools and other regions. The first customer is the OJT coordinator, who carries the workload, holds the budget request, and brings students and partner companies along.

> Open item (from the proposal): add the number of colleges and OJT-required programs in the starting region from CHED or school-directory data. Do not use a national figure unless it is sourced.

### 7.4 First-Year Success Measures

Number of schools signed, students deployed, partnerships formed, share of records completed on time, and school renewal rate.

---

## 8. Competitive Advantage

| Alternative | What It Does | Where It Falls Short |
|-------------|--------------|----------------------|
| Manual process (emails, paper, spreadsheets) | Works with no new tools | Slow, easy to lose records, no visibility |
| Job boards (LinkedIn, Indeed) | Large audience for paid roles | Built for hiring, not OJT; no school monitoring |
| Generic school information systems | Store student records | Don't connect schools to companies |
| **Dugtong** | Marketplace + management + protection | Newer, needs a pilot to prove value |

**Our edge:**

- Verified companies and schools (document checks before account creation)
- Scope-of-work safeguard (no job board offers this)
- Evaluation history that builds a lasting data advantage

> Open item (from the proposal): check which local OJT or internship platforms exist and add them to this table before submission.

### 8.1 Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Marketplace cold start | Start with schools and their existing partners; keep posting and browsing free |
| Slow school sales | Free pilots, founding-school pricing, and a clear time-saved result from the first cycle |
| Fake or exploitative companies | Document verification, trust scores, and suspension for repeated upheld reports |
| Student data privacy | Consent, role-based access, encryption, limited retention, Data Privacy Act compliance |
| Companies post but get no applicants | Schools can send placement requests directly, so supply is matched, not only advertised |
| Misuse of the report feature | School review first, required details, and a clear appeal path for companies |
| Low renewal after the first term | Build records, MOAs, and audit history that grow in value each semester |

---

## 9. Technical Architecture

### 9.1 Presentation Layer

- Next.js 15 App Router with React 19 and TypeScript.
- Tailwind CSS 4 for styling.
- One responsive application with role-aware views for Coordinator, Supervisor, Student, and Dugtong Admin.
- Support mobile layouts from 375px and desktop layouts.
- Follow Section 10 of this unified context for UI tokens, components, accessibility, and interaction states.

### 9.2 Application and Data Layer

- Supabase is the chosen backend platform, using PostgreSQL and Supabase Auth where configured.
- Use the existing Supabase client setup, environment variables, schema, generated types, and query patterns found in the repository.
- Use Next.js Route Handlers or Server Actions only where the existing application architecture calls for them.
- Use Zod for validation where already adopted or where appropriate to the existing forms and server boundaries.
- Core product domains include schools, companies, listings, partnership requests, MOAs, deployments, attendance, journals, evaluations, reports, trust scores, and audit history. These are conceptual domains, not a mandate to rename or recreate database tables.

### 9.3 Stack Reference

| Layer | Technology / Rule |
|---|---|
| Frontend | Next.js App Router, React, TypeScript; preserve installed versions (documented target: Next.js 15, React 19) |
| Styling | Existing Tailwind CSS setup and the tokens in Section 10 of this unified context |
| Backend / database | Supabase PostgreSQL, using the project's existing integration |
| Authentication | Supabase Auth; preserve the existing auth/session flow and provider configuration |
| Authorization | Existing role checks and Supabase Row Level Security (RLS) policies |
| Validation | Existing validation approach; Zod where appropriate |
| File storage | Supabase Storage for supported file workflows; preserve existing buckets, policies, and configuration |
| Deployment | Vercel; preserve the existing project configuration |
| Notifications | Preserve configured in-app/email notification integrations |

### 9.4 Security and Data Integrity

- Preserve existing Supabase schemas, migrations, policies, triggers, functions, and generated types.
- Security baseline: every Supabase table must have RLS enabled and explicit policies. Inspect and report any gap as a security blocker; do not silently alter policies—request an approved security/backend ticket first.
- Never disable, weaken, or bypass Row Level Security (RLS) or role-based access controls to make a screen work.
- Keep tenant and role boundaries intact; users must only access records their role and school/company membership authorize.
- Do not add a Supabase `service_role` key or any `sb_secret_` key to the project source, and never expose secrets in client code. The only Supabase values allowed in `NEXT_PUBLIC_` variables are the project URL and publishable/anon key.
- Keep audit-relevant changes to attendance, hours, evaluations, MOAs, reports, and trust data traceable using the existing implementation.
- Treat Data Privacy Act (RA 10173) safeguards, consent, retention, and secure handling of student information as product requirements.
- Do not replace authentication, migrate databases, or change data contracts as part of a visual/UI-only task.

---

## 10. Design System and Frontend Standards

This section incorporates the former standalone UI Design & Frontend Agent Guide (v1.3). This unified context contains the visual system so an agent does not need a separate design guide to understand UI rules. The root `CLAUDE.md`, approved `docs/SPEC.md`, and active ticket remain mandatory sources of project/workflow authority. When visual guidance and product workflows appear to conflict, follow the explicit notes in Section 12 and ask the team before changing a workflow.

### Mission

Build a polished, credible, accessible platform for schools, companies, and students. Prioritize trust, clear workflows, audit-friendly information, calm data density, and visible student protection. Aim for Linear-level clarity and Stripe-level consistency—not a generic AI dashboard, decorative gradients, flashy hover effects, or oversized cards.

### 10.1 Non-negotiable implementation guardrails

- Use the existing **Next.js + React + TypeScript + Supabase** project. Follow installed versions, routing, styling, Supabase clients, generated types, and component conventions. Do not create a standalone HTML prototype.
- Inspect before editing: routes, components, auth/session flow, Supabase queries, generated types, schema, Row Level Security (RLS), `package.json`, Tailwind version, `components.json`, and existing `components/ui` files.
- This is primarily a design and frontend task. Do not casually change Supabase tables, migrations, RLS policies, authentication, server actions, API contracts, relationships, or business rules to make a screen easier to build.
- Reuse existing Supabase clients and authorized data-access paths. Never expose service-role keys in client code or bypass RLS. Keep privileged operations server-side.
- Do not replace live data with hardcoded demo data, remove features, invent endpoints, or make controls appear functional when they are not. If backend support is missing, report the dependency instead of faking it.
- Keep changes scoped and preserve working behavior, permissions, routing, and existing styling conventions.

### 10.2 Component implementation: shadcn/ui

**Use shadcn/ui as the default foundation for reusable interface primitives.** Build product-specific components on top of it rather than creating inconsistent one-off controls.

- First inspect `package.json`, `components.json`, Tailwind configuration, and `components/ui`. Reuse the current shadcn setup if present.
- If shadcn/ui is not configured, add it using setup instructions compatible with the project's existing Next.js, React, TypeScript, and Tailwind versions. Make the smallest required configuration change; do not reset the project, overwrite unrelated components, or migrate Tailwind versions just to install it.
- Add only the components needed for the current work. Prefer the existing shadcn components where available: `Button`, `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `RadioGroup`, `Card`, `Badge`, `Table`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Sheet`, `Tabs`, `Skeleton`, `Progress`, `Tooltip`, `Breadcrumb`, `Avatar`, `Separator`, and `ScrollArea`.
- Use `Sheet` or the project's accessible navigation primitive for mobile navigation; do not hide the sidebar without providing a usable replacement.
- Use `AlertDialog` for destructive or high-impact confirmations. Use the project's existing toast system; if none exists, use a compatible shadcn-supported toast approach without duplicating notification libraries.
- Use the project's existing icon library. If `lucide-react` is already available, use it consistently for interface icons. Avoid emoji as interface icons.
- Customize shadcn components through semantic theme tokens and variants. Avoid scattered inline colors, one-off radius values, and duplicate components that differ only slightly.
- Keep accessible behavior intact: labels, keyboard interaction, focus management, disabled/loading states, and screen-reader names. Do not remove accessibility attributes to simplify styling.
- Do not make every component visually identical by default. Use the same foundation, tokens, and interaction rules while choosing suitable layouts for tables, forms, dashboards, and marketplace cards.

### 10.3 Product roles and canonical workflows

Use one consistent design system with role-aware navigation and actions.

- **Coordinator (school):** imports/manages students, deploys students to placements, requests partnerships, approves journals, monitors hours and attendance, reviews evaluations, tracks MOA expiry, and generates reports.
- **Supervisor (company):** manages company listings and scope of work, accepts/declines partnership requests, views assigned interns, logs attendance, submits evaluations, and views company trust information. **Does not approve journals.**
- **Student:** browses public listings, views assigned deployment and hours, acknowledges the agreed scope of work on first login, submits journals/hour logs only through supported workflows, views attendance, and accesses report/appeal options.
- **Dugtong Admin:** verifies schools and companies, reviews escalated reports/appeals, monitors activity and trust scores, and uses existing moderation/suspension controls.
- **Public visitor:** browses verified company listings without an account. Require sign-in only when the actual workflow needs it.

#### Workflow rules

1. The Coordinator deploys students. Do not invent a student “My Application” process or student MOA-signing flow.
2. On first login after deployment, prominently show the actual scope of work for acknowledgment. Show company, tasks, required hours/schedule, acknowledgment action, and recorded status/date when supported by real data.
3. The Supervisor records attendance. The student attendance view is for viewing records/status. Do not add student self time-in/time-out or “Location verified” unless explicitly supported by product requirements and backend.
4. The Coordinator approves journals. Supervisor screens focus on attendance, evaluations, assigned interns, listing/scope management, and partnership decisions.
5. Make the student report/appeal channel discoverable from placement and scope-of-work screens. Follow the existing escalation flow; do not invent outcomes or status transitions.
6. Do not invent application document requirements, such as medical certificates or parent consent. Display only requirements supported by actual product rules and data.

### 10.4 Design tokens

Define tokens centrally using the project's existing CSS/theme setup. Use semantic names in components; map them to Tailwind `@theme` only if the installed project uses Tailwind v4. Do not scatter raw hex values through component styles.

#### Light theme (default)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Main background |
| `--color-surface` | `#F5F7FA` | Subtle surfaces and table headers |
| `--color-surface-hover` | `#EEF2F7` | Subtle darker hover surface for secondary controls, cards, and rows |
| `--color-text` | `#0F172A` | Primary text |
| `--color-muted` | `#596579` | Secondary text and captions |
| `--color-border` | `rgba(15,23,42,.08)` | Borders and dividers |
| `--color-primary` | `#2563EB` | Primary actions and active states |
| `--color-primary-hover` | `#1D4ED8` | Solid primary hover; no gradients |
| `--color-primary-soft` | `#93B4F5` | Tints only where contrast is valid |
| `--color-teal` | `#0EA5A5` | Accent backgrounds and graphics; not small text on white |
| `--color-teal-text` | `#086A6A` | Accessible verified text on pale teal |
| `--color-success` | `#10B981` | Success accents |
| `--color-warning` | `#F59E0B` | Warning accents |
| `--color-danger` | `#DC2626` | Error and destructive accents |

#### Dark theme

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0B1220` | App background |
| `--color-surface` | `#0D1526` | Content surface |
| `--color-surface-hover` | `#17233A` | Subtle lighter/deeper-contrast hover surface on dark UI; keep the overall appearance dark |
| `--color-sidebar` | `#111A2E` | Navigation and elevated surface |
| `--color-text` | `#F1F5F9` | Primary text |
| `--color-muted` | `#94A3B8` | Secondary text |
| `--color-border` | `rgba(59,130,246,.15)` | Borders |
| `--color-primary-text` | `#A5C7FF` | Readable blue emphasis; never use `#2563EB` as dark-mode text |

#### Status colors

Always pair a status color with a readable label and, where useful, an icon. Check contrast in the rendered theme.

| Status | Light background / text | Dark background / text |
|---|---|---|
| Verified | `#DDF4F4` / `#086A6A` | `rgba(14,165,165,.18)` / `#3CCFCF` |
| Pending | `#FEF3D7` / `#8F5A06` | `rgba(245,158,11,.16)` / `#F5B74A` |
| Approved | `#D9F5EA` / `#087A55` | `rgba(16,185,129,.16)` / `#34D399` |
| Rejected | `#FDE4E4` / `#B31B1B` | `rgba(220,38,38,.18)` / `#F87171` |
| Escalated | `#7F1D1D` / `#FFFFFF` | `rgba(127,29,29,.35)` / `#FCA5A5` |
| Trust score | `#E5EEFE` / `#1D4ED8` | `rgba(59,130,246,.18)` / `#A5C7FF` |

#### Contrast rules

- Target WCAG 2.1 AA: at least 4.5:1 for normal text and 3:1 for large text and meaningful UI boundaries/graphics.
- Never use primary blue `#2563EB` as text on dark backgrounds; use the accessible light tint.
- Never use `#0EA5A5` for 12px text on white or as a white-text button fill. Use `#086A6A` for small verified text on pale teal, or use teal as an accent with a compliant foreground.
- Muted text must meet 4.5:1 for normal text. Validate all status pairs in both themes.
- Focus indicators must be visible in light and dark modes. Color alone must never communicate state.

### 10.5 Typography

| Role | Size / line-height | Usage |
|---|---|---|
| H1 | 32 / 40px | Page title |
| H2 | 24 / 32px | Section title |
| H3 | 18 / 24px | Card/subsection title |
| Body | 15 / 24px | Body text, controls, table content |
| Caption | 12 / 16px | Labels and metadata |
| Eyebrow | 12 / 16px | Short uppercase label; `.08em` letter spacing |

- Headings: Satoshi, falling back to Inter Tight, Inter, system-ui; weight 500 and `letter-spacing: -0.02em`.
- Body/UI: Inter, fallback system-ui. IDs and numeric metadata: JetBrains Mono, fallback ui-monospace.
- Use the defined scale for standard UI text. No 11px labels, arbitrary 13/14px control text, or oversized 44px dashboard headings.
- All-caps is for short eyebrow labels only, not sentences. Use normal case for labels and buttons.

### 10.6 Layout and shell

- Maximum content width 1440px; 12-column desktop grid; 24px gutters.
- Page padding: 24px desktop, 16px mobile.
- Spacing scale only: 4, 8, 12, 16, 24, 32, 48, 64px.
- Radius: cards 12px; buttons/inputs 8px; pills 999px.
- Shadow: `0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.05)`. Prefer borders and surface contrast over heavy shadows.
- Desktop shell: consistent sidebar and topbar. Every authenticated page has a page title, useful breadcrumb where relevant, and one role-appropriate primary action when an action exists.
- Below 820px, replace the desktop sidebar with working mobile navigation (drawer or role-appropriate bottom navigation); never simply hide navigation.
- Test at 375px, tablet, and desktop. Prevent page-level horizontal overflow. Tables must use contained horizontal scrolling or a deliberate mobile row/card treatment.

### 10.7 Shared component requirements

Build on shadcn/ui primitives and apply the Dugtong tokens consistently.

- **Buttons:** primary, secondary/outline, ghost, destructive, link. States: default, hover, focus-visible, active, disabled, loading. Hover must feel restrained and professional: darken solid fills, or apply a subtle darker surface to secondary/ghost controls. Primary blue changes from `#2563EB` to solid `#1D4ED8`. Never use gradients, glow, scale/bounce effects, or flashy transitions.
- **Inputs:** text, password, search, select, textarea, checkbox, radio. States: default, focus, filled, error, disabled. Use persistent labels, clear required indicators, and actionable inline error text. Add date/file fields only for real workflows.
- **Dialogs:** modal and confirmation dialog for destructive/high-impact actions; clear title, consequence, cancel/confirm labels, keyboard support, focus management, and loading/error feedback.
- **Pills:** Verified, Pending, Approved, Rejected, Escalated, Trust Score. Include readable label and optional appropriate icon.
- **Cards:** KPI, student, company, and marketplace listing variants with consistent hierarchy and action placement.
- **Tables:** sortable columns only when sorting works; clear headers, readable rows, subtle darker row hover, visible keyboard focus, status pills, aligned numeric values, functional pagination only, and loading/empty/error states.
- **Navigation:** role-aware sidebar, selected state, blue active indicator, breadcrumbs, tabs, mobile navigation, and accessible icon labels. Hover should use a subtle darker surface, not a gradient; keep selected and hover states visually distinct. Never show unauthorized actions.
- **Feedback:** success/error/info toast or alert. Do not use color as the only signal.
- **Progress:** linear/ring/stepper with numeric or text equivalent. Values must match underlying data.
- **Data states:** purposeful skeletons, helpful empty states with a next step, error states with safe retry where applicable, and disabled states with an explanation.
- **Forms:** responsive layout, persistent labels, inline validation, keyboard navigation, submission state, success/failure response, and protection from accidental double submission.

### 10.8 Role-specific screen guidance

- **Coordinator dashboard:** KPIs, student deployment/progress table, journal approval queue, partner summaries, MOA expiry alerts, and recent activity. Journal approval belongs here.
- **Supervisor workspace:** assigned interns, attendance logging, evaluation forms, listing/scope management, and partnership request decisions. Do not place journal approval actions here.
- **Student portal:** deployment details, required/completed hours, agreed scope, journal/hour-log workflows supported by the backend, read-only attendance records, authorized evaluation visibility, and a clear report/appeal entry point. Scope acknowledgment must be prominent; show recorded status/date when available.
- **Dugtong Admin:** verification requests, escalated reports/appeals, trust oversight, and platform controls already supported by the application.
- **Public marketplace:** browse without an account; show company verification, role, scope summary, relevant course, hours/schedule, location/work setup, slots, and trust information only when real data exists.

### 10.9 Supabase and data integrity

- Use the existing Supabase integration and typed data access. Follow current auth/session handling and server/client boundaries.
- During a design-only pass, preserve schema, migrations, RLS policies, auth configuration, storage rules, and business logic. Do not add tables, alter policies, or change queries unless backend work is explicitly authorized.
- Never place service-role credentials in browser code. Use public client configuration only where intended; privileged operations stay server-side.
- UI visibility is not authorization. Respect server-side permissions and RLS; never rely only on hiding a button.
- Do not fabricate trust scores, verified status, attendance/location checks, application documents, MOA signatures, report outcomes, or audit records.
- If a screen depends on missing backend behavior, build only the UI supported by existing fields and report the missing dependency to the lead. Do not simulate a successful save.

### 10.10 Accessibility and interaction quality

- Use semantic React components, keyboard support, visible `:focus-visible`, accessible names for icon-only actions, and logical focus order.
- Preserve shadcn component accessibility behavior; do not remove labels, ARIA attributes, focus management, or keyboard interaction to simplify styling.
- **Hover behavior:** Use subtle, solid-color darkening as the default interaction cue. On light surfaces, shift toward a slightly darker neutral (`#F5F7FA` → `#EEF2F7`); on dark surfaces, use a restrained surface shift (`#0D1526` → `#17233A`) while preserving the dark appearance. For outlined controls, slightly strengthen the border and darken the surface. For cards and table rows, use a subtle background/border change—not a glow or large shadow. Keep hover distinct from active, selected, disabled, and focus-visible states. Never use gradients for hover.
- Use short, restrained transitions for color, background-color, and border-color only; respect `prefers-reduced-motion`. Avoid scaling, bouncing, animated gradients, glowing outlines, or dramatic movement.
- Keep feedback near the action that caused it. Preserve form state on recoverable errors where possible.
- Every visible control must have a real outcome. No dead buttons, fake sorting, fake charts, decorative filters, or links without destinations.
- Use concise professional copy and Philippine OJT terms consistently. Format dates, hours, and IDs clearly.

### 10.11 Definition of done

- [ ] Uses the existing Next.js + React + TypeScript + Supabase project; no standalone HTML prototype.
- [ ] Uses shadcn/ui as the shared component foundation, reusing existing setup and adding only compatible components needed for the task.
- [ ] Existing backend contracts, Supabase schema/RLS, auth, permissions, and business rules remain unchanged unless separately authorized.
- [ ] Coordinator approves journals; Supervisor logs attendance, submits evaluations, and handles partnership decisions.
- [ ] Students acknowledge the agreed scope and can find report/appeal access; no fabricated student application/MOA flow or unsupported attendance location feature.
- [ ] Design tokens and components are consistent across roles and themes; hover states use restrained solid-color darkening with no gradients, glow, bounce, or scale effects; no sub-12px text.
- [ ] Applicable components include required states; mobile navigation works below 820px.
- [ ] Contrast, keyboard navigation, responsive layout, empty/loading/error/success states, and real interaction paths are checked.
- [ ] Run existing lint, type-check, test, and production-build commands where available; fix regressions introduced by frontend changes.
- [ ] Final handoff lists changed frontend files, checks run, and missing backend dependencies. Disclose any separately authorized backend changes.

---

## 11. What Makes This a SaaS (Not a School Tool)

1. **Multi-tenant.** Many schools use the same platform. Each school sees only their data.
2. **Role-aware.** Four user types, one system, different views.
3. **Business model.** Schools pay, companies join free, students browse free.
4. **Marketplace.** Companies and schools connect — the platform provides discovery, not just management.
5. **Trust layer.** Verified badges, trust scores, and scope-of-work protection.
6. **Recurring revenue.** Per-student per-semester pricing creates predictable income.
7. **Data moat.** Each semester adds records that are painful to migrate.

---

## 12. Team Ownership, Handoffs, and Open Decisions

This section consolidates the individual role guides for Neil, Khent, Josiah, and Arwin. The project now uses one shared laptop, so these are **responsibility boundaries**, not assumptions about separate machines or local repositories. Inspect the shared repository before work. Do not delete original role files or other documentation without team approval.

### 12.1 Ownership at a glance

| Owner | Owns | Must not independently change |
|---|---|---|
| **Neil Mar — UI/UX and frontend design system** | Design tokens, shared UI components, wireframes/clickable prototype, public browsing UI, listing/search/filter presentation, evaluation report and completion certificate templates, pitch visuals and demo polish | Database schema/migrations, RLS, authentication, roles, verification logic, marketplace/business logic, student upload, deployments, attendance/hour calculation |
| **Khent — Security, accounts, and student protection** | Supabase Auth integration, server-derived role access, RLS review, organization verification and document access, server-side student account creation mechanism, audit-log/security review, scope acknowledgment, student reports/appeals | Marketplace and partnership business logic, upload parsing/deployments/attendance logic, shared visual design system |
| **Josiah — Marketplace, partnerships, evaluations, and admin dashboard** | Company listings, school partner requests, listing search/filter data logic, partnership request rules, supervisor evaluation workflow, final evaluation report and completion-certificate data, admin dashboard UI/actions that call Khent-owned verification/report logic, clearly labeled demo seed data | Auth/roles/RLS design, verification/report logic, student upload/deployment/attendance/hour totals, shared visual design system |
| **Arwin — School-side OJT tracking** | CSV/Excel student upload, template and validation, student list/statuses, deployments, attendance/hour-total logic, coordination with Josiah on accepted partnerships and evaluation hour inputs | Auth/roles/RLS design, verification/audit-log mechanism, listing/partnership/evaluation business logic, shared visual design system |

**Scope rule:** This matrix defines ownership, not permission to build every item listed in a role guide. `docs/SPEC.md` and the active approved ticket define what is in the MVP and may be implemented now. Items labelled Next/Later or absent from the approved ticket must not be silently added.

### 12.2 Handoffs

- **Neil ↔ Josiah:** Josiah provides confirmed listing/filter/evaluation field names and data shapes. Neil provides listing pages, search/filter UI, forms, evaluation report layout, and certificate templates. Templates display only stored values when wired.
- **Neil ↔ Arwin:** Arwin provides confirmed upload, student, deployment, attendance, hour-total, approval, and status fields. Neil supplies wireframes/screens before presentation changes that affect Arwin's workflow.
- **Neil ↔ Khent:** Khent provides login/role, verification status, authorized document access, scope-acknowledgment, and report/appeal capabilities. Neil provides corresponding screens and accessible forms.
- **Khent ↔ Arwin:** Coordinate server-side student account creation from uploads, role checks, and attendance/hour audit entries. Elevated account creation remains server-side.
- **Khent ↔ Josiah:** Josiah reads verification statuses and invokes Khent-owned verification/report actions. Only verified companies may post listings and only verified schools may post requests when the approved backend supports those checks.
- **Josiah ↔ Arwin:** Josiah owns partnership data/rules; Arwin may create deployments only for accepted partnerships. Evaluation reports consume Arwin's approved hour totals. Agree on data contracts/schema before any approved backend implementation.
- **Everyone:** Confirm field names, status values, routes, schema, and API shapes from code/migrations or the owner. Never guess. Security/RLS review is required for every approved migration affecting protected data.

### 12.3 Canonical product rules

- **Coordinator:** manages/imports students, assigns deployments, approves journals, tracks progress, requests partnerships, tracks MOAs, reviews evaluations, and prepares reports.
- **Supervisor:** manages company listings/scope, decides incoming partnership requests, records attendance through the approved workflow, evaluates interns, and views authorized company information. The Supervisor does **not** approve student journals.
- **Student:** does not self-register; student accounts are created through the approved verified-school process. Students view assigned deployments, acknowledge the agreed scope, submit journals/hour logs only through supported features, view attendance, and access reporting/appeal options where implemented.
- **Dugtong Admin:** verifies schools/companies and handles approved moderation/report actions. Do not duplicate Khent's verification or report logic in other modules.
- **Public visitors:** may browse active public listing fields without an account. Never expose student information, internal notes, private verification documents, or non-public company contact details.
- Every listing must define its scope of tasks before publication. The scope must be prominent in listing details and the student's acknowledgment step.
- Either party may start a partnership request. Only the receiving party may accept or decline; the sender cannot accept their own request. Canonical states are `requested`, `accepted`, and `declined` unless the approved spec changes them.
- A deployment may be created only from an accepted partnership.
- Student account creation and other operations requiring elevated Supabase access must happen server-side. The service-role key must never reach the browser.
- Audit logs are append-only for normal roles and must use Khent's existing mechanism. Preserve actor, action, timestamp, and old/new values where the current audit contract supports them.
- Evaluation reports and completion certificates use confirmed templates and stored data only. Prototype/seed data must be fictional and clearly labelled sample; never present fake records as real.

### 12.3.1 Additional owner-specific implementation rules

**Neil — UI/UX and shared components**
- Shared components should be generic, driven by props, and must not fetch data or know about Supabase. Keep data access in the appropriate route, page, hook, or service layer already used by the project.
- Public pages render only the approved public listing fields. Never show student data, internal notes, private verification documents, or unapproved contact details to a visitor.
- Provide loading, empty, and error states for each relevant screen, plus keyboard access, visible focus, labels, contrast, and mobile/desktop checks.
- Share wireframes before building screens that materially affect Arwin's upload/attendance flows. Confirm before changing shared components relied on by other contributors and report what changed.
- Mobile and desktop layouts are both required. Ask the team whether the pilot should prioritize student mobile use or coordinator desktop use before choosing a mobile-first priority.

**Khent — accounts, access, verification, and protection**
- Roles must come from trusted server-side data. Never trust a role supplied by the browser. The role storage mechanism (database table or JWT claims) remains undecided unless existing code/spec confirms it; do not choose alone.
- School and company accounts must not be active until the admin approves the required verification documents. Students are created only through the verified school's approved upload workflow, never by student self-registration.
- Verification documents belong in a private storage bucket. Use short-lived signed URLs and allow access only to the owning party and authorized admins. Confirm exact document requirements before enforcing them.
- Audit logs are append-only for normal roles. Do not allow ordinary users to update or delete them. Use the existing audit mechanism; include who/what/when and old/new values where the established schema supports them.
- Reports need a short description and a related task or date. Do not reveal the reporting student's identity to the company unless the team explicitly approves that policy.
- Test access as visitor, student, coordinator, supervisor, and admin for each table touched. Report actual read/write results. Never log personal data or tokens; collect only what OJT requires and flag uncertain privacy obligations rather than deciding them independently.

**Josiah — marketplace, partnership, evaluation, and reports**
- Public visitors may read only the approved public fields of active listings, through the existing view/query/policy. Confirm the public-field allowlist with the team; do not expose internal notes or private documents.
- A listing cannot be published without a defined scope of tasks. The scope is a student-protection requirement, not optional marketing copy.
- Only verified companies may post listings and only verified schools may post school partner requests where the existing backend supports those checks.
- Partnership requests use only `requested`, `accepted`, and `declined` unless an approved spec authorizes another state. Only the receiving party can decide; the sender cannot accept their own request.
- Evaluation form criteria and rating scales are not yet specified unless current code/spec supplies them. Do not invent fields or scales; request the pilot-school/approved form.
- Generate reports and completion certificates exclusively from stored student, school, company, approved-hour, and evaluation values. Never fill missing values with guesses. Demo seed data must be obviously fictional and labelled sample.
- Test visitor, student, coordinator, supervisor, and admin visibility where relevant; confirm unverified organizations cannot publish and that the partnership sender cannot accept their own request.

**Arwin — student upload, deployment, and OJT tracking**
- Validate uploaded files on the server: file type, size, row count, required columns, duplicates, and malformed values. Show row-level errors with row number, column, and reason. Required columns, size limit, row limit, and whether partial imports are permitted remain undecided unless code/spec confirms them; ask before choosing.
- Never import silently. Tell the user which rows will be accepted/rejected and follow the team's approved partial-import rule.
- Create a deployment only when Josiah's partnership record is accepted. Do not redefine or duplicate the partnership schema.
- Calculate hour totals from approved attendance records on the server or database; never trust a client-supplied total.
- Attendance/hour changes must write audit records using Khent's existing mechanism. Preserve the tenant boundary: a Coordinator sees only their school's students, and a student sees only their own records where student access is enabled.
- The described student time-in/out flow conflicts with the current canonical UI workflow. Do not implement self time-in/out until the team resolves it in `docs/SPEC.md`.

### 12.4 Conflicts and unresolved decisions — do not guess

1. **Attendance interaction conflict:** Arwin's role guide says students time in/out and Supervisors approve attendance. The consolidated product/design rules say the Supervisor records attendance and the Student attendance screen is read-only, with no self time-in/out or location verification. The hackathon proposal (Oct 14, 2026) lists "daily time-in and time-out with supervisor approval" as an MVP feature used by students and supervisors, which supports Arwin's version. For UI work, follow the canonical rule (Supervisor records, student read-only) unless the team updates the approved spec to resolve the conflict. Do not implement student self time-in/out meanwhile.
2. **Journal approval conflict:** The proposal describes weekly journals as accomplishment reports with **supervisor sign-off** (Next stage, not MVP). The canonical product/design rules say the **Coordinator** approves journals and the Supervisor does not. Follow the canonical rule until the team resolves this in `docs/SPEC.md`; journals are not MVP in either source.
3. **MVP scope:** The current handoff describes the MVP as one user type (Coordinator) and one core job (deploy → track → approve → report). The proposal's hackathon demo flow is broader: company posts, school requests, student browses, school uploads students, attendance logged, evaluation generated. The individual role guides list broader marketplace, student, verification, and admin features. Implement only what the approved `docs/SPEC.md` and active ticket authorize.
4. **Report escalation:** The product concept describes reports going to the Coordinator and escalating to Dugtong Admin if unresolved, while Khent's role guide labels automated escalation, company response, and suspension as Next/Later. Build only report/escalation behavior explicitly covered by the approved MVP spec/ticket; do not invent transitions, company responses, or suspension automation.
5. **Verification documents:** The business concept gives examples (and the proposal flags confirming CHED and pilot-school requirements as an open item), while Khent's role guide says the exact requirements need confirmation. Confirm approved requirements before making documents mandatory in UI or backend.
6. **Unspecified details:** Role storage (table vs JWT claims), pilot pricing (per-student vs flat annual fee), pilot school/department, upload columns/file/row limits, partial-import behavior, evaluation fields/rating scales, reporter identity visibility, and public listing field allowlist are open unless current code or the approved spec resolves them. Ask the relevant owner; do not guess.
7. **Later features:** Company/school profile expansion, trust-score display, verified-badge commercialization, compliance dashboard, subscription plans/payments, alumni features, talent pipeline, notifications, digital MOAs, accreditation exports, and similar additions are not authorized just because they appear in product vision or a role guide.

### 12.5 One-laptop operating rule

- Treat the checked-out repository as the source of truth. Do not assume another machine's path, installed packages, environment, branch, or uncommitted work exists here.
- Inspect the current branch, working tree, package manager/lockfile, relevant environment-variable names (never print secret values), routes, and scripts before relevant work.
- Do not copy secrets or commit `.env.local`. Do not overwrite teammate changes. Since the working tree is shared, inspect diffs before editing files another owner may be working on.
- Coordinate ownership by module, not by machine. A shared laptop does not authorize one owner to change another owner's backend or business logic.
- Treat this unified context as the consolidated guide. Do not delete the original role guides, Section 10 of this unified context, or other project documentation without team approval.

---

## 13. Repository Structure and Agent Rules

- Read this file, Section 10 of this unified context, and the approved ticket/spec before implementation. Check the live deployment first as required by the workshop rules.
- Inspect the actual repository before proposing file paths or editing code. Identify existing routes, components, UI primitives, Supabase clients, auth/session flow, generated types, and styling conventions.
- Reuse `src/components/ui/` shadcn/ui components and existing routes, hooks, types, and Supabase access paths where practical. Do not scaffold a replacement app or duplicate infrastructure.
- Keep work scoped to the approved ticket and the MVP defined in `docs/SPEC.md`. Put new ideas in `docs/LATER.md` rather than expanding scope.
- For UI-focused work, prefer presentation, accessibility, responsive behavior, and frontend interactions. Preserve backend contracts, schema, RLS, auth, permissions, and business rules unless backend work is explicitly approved.
- If the approved spec is missing, do not implement feature code. Ask the team to run `/grill-with-docs`, then `/to-spec`.
- If a required UI depends on a backend capability that does not exist, clearly report the missing dependency. Do not fake a successful save, fabricate data, or invent an endpoint.
- Use existing `npm run` scripts for linting, type-checking, tests, and builds where available. After the ticket, report changed files, checks performed, remaining issues, and the available live/preview URL status.

---

## 14. Contributor Git Workflow — Neil

**These rules are mandatory. Read this section before suggesting or running any Git command. Do not propose an alternative workflow unless Neil explicitly asks.**

### Initial branch setup — completed

Based on Neil's terminal log on October 15, 2026, the initial branch setup is complete:

- The local `dev` branch was created from and tracks `origin/dev`.
- The local `neil` branch was created from `dev`.
- `git push -u origin neil` successfully created `origin/neil` and set the local `neil` branch to track it.
- The last shown terminal prompt was on `neil`.
- Do not repeat the branch-creation or initial upstream setup commands unless Neil explicitly asks or the actual repository state shows the setup is missing.

For future work, follow the normal workflow below: update `dev`, merge `dev` into `neil`, do all work on `neil`, and push only to `origin/neil`. The team leader alone merges into `dev` and `main`.

### Shared-laptop branch snapshot

The last handoff reported the local branch `ticket-01-tokens-theme`, based on `neil`. Treat that as a historical snapshot and inspect the actual repository before acting. The standing rule remains: Neil pushes only to `origin/neil`. If the current branch is not `neil`, stop and explain the mismatch before switching, merging, committing, or pushing; do not infer permission to push to `origin/ticket-01-tokens-theme`.

### Branch ownership

- `main` is production. The team leader alone manages production merges.
- `dev` is the integration branch. The team leader alone merges work into it.
- `neil` is Neil's working branch. Neil pushes only to `origin/neil`.

### Required workflow

1. Update local `dev` from `origin/dev`.
2. Switch back to `neil` and merge `dev` into `neil` before starting work.
3. Do all implementation and commits on `neil`.
4. Push only to `origin/neil`.
5. Tell the team leader when the branch is ready for their merge.

### Approved commands

Update `neil` with the latest `dev` using this exact sequence:

```bash
git checkout dev
git pull origin dev
git checkout neil
git merge dev
```

Commit and push work from `neil`:

```bash
git add .
git commit -m "message"
git push origin neil
```

### Prohibited actions

- Never push to `origin/dev` or `origin/main`.
- Never merge `neil` into `dev` or `main`.
- Never commit work on `dev` or `main`.
- Never force-push; do not use `git push -f` or `git push --force`.
- Do not change branches or run Git commands on Neil's behalf without first reading these rules and checking the current repository state.

### Merge conflicts

If merging `dev` into `neil` causes conflicts, help Neil resolve them on `neil`, inspect the resulting changes, then commit and push only to `origin/neil`. The team leader handles any later merge into `dev` or `main`.

---

## 15. Agent Confirmation Rules — Always Ask Before Acting

These rules preserve team control. Do not ask for approval for every routine edit that is already specified in an approved ticket; do ask before crossing a permission, safety, stack, scope, or data boundary.

### Stop and get explicit approval before

- Adding a framework, database, hosting provider, CSS/component library, paid service, or dependency that is not already part of the approved stack.
- Changing Supabase schema, migrations, RLS policies, auth/session behavior, storage rules, server-side permissions, API/data contracts, or generated types in a way that changes backend behavior.
- Performing destructive or hard-to-reverse operations, deleting user data/files, changing environment or deployment configuration, or altering production behavior.
- Expanding beyond the approved ticket/MVP, changing product rules or role responsibilities, or introducing a new workflow or required document.
- Performing a Git operation that conflicts with Section 14, or any force-push, branch push, or merge outside Neil's permitted workflow. Never run `git push origin dev` or `git push origin main`.
- Making claims that a feature, save, deployment, verification, or report worked when it has not been tested against the real implementation.

### Before work and after each ticket

1. Inspect the repository and its current state; do not assume the app, spec, UI library, scripts, or deployment are configured as expected.
2. If `docs/SPEC.md` is missing, stop before feature coding and tell the team to run `/grill-with-docs`, then `/to-spec`.
3. State a brief plan for a multi-step ticket. Make only the changes needed for that ticket.
4. After the change, explain in two or three plain-English sentences what changed and why. Report tests/build checks, known limitations, changed files, and whether a live or preview URL was verified.
5. Finish one ticket and wait for the team's next instruction unless told to continue.

If a requested action conflicts with this context, Section 10 of this unified context, the approved spec, or Neil's Git rules, do not silently choose one. Explain the conflict in plain English and ask the team to resolve it before proceeding.
