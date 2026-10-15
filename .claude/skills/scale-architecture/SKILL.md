---
name: scale-architecture
description: Comprehensive System Design and Architecture (SDA) standard for Dugtong OJT. Strictly governed by root CLAUDE.md and CONTEXT.md. Preserves the existing Next.js 15 + React 19 + Hosted Supabase codebase without destructive rewrites, enforces the Five Workshop Rules, enables direct Supabase access + live Supabase Realtime CDC/Broadcast updates, applies all 7 Software Engineering Pillars, protects high-concurrency bursts (thousands of simultaneous clicks), scales to 1,000,000 users, enforces Section 10 UI/Design Tokens, and guarantees Philippine Data Privacy Act (RA 10173) compliance.
---

# Dugtong OJT — Master System Design & Architecture (SDA)

This skill governs all architectural decisions, module boundaries, real-time data synchronization, database indexing, multi-layer caching, API rate limiting, high-concurrency safeguards (thousands of simultaneous clicks), 1M-user scalability, and security controls for **Dugtong OJT**.

---

## 0. Hierarchy of Authority & Mandatory Reading Order

1. **Root `CLAUDE.md` (The Supreme Rule):** Highest authority (Pinned stack, The five rules, Working with this team, The workflow, Where things live). Never override or modify.
2. **`CONTEXT.md` (Unified Project Context):** Consolidated product vision (Sections 1–8), Technical Architecture (Section 9), Design System & Tokens (Section 10), SaaS Model (Section 11), Team Ownership & Handoffs (Section 12), Repository Rules (Section 13), Contributor Git Workflow (Section 14), and Agent Confirmation Rules (Section 15). Never modify without team approval.
3. **Approved `docs/SPEC.md` & Active Ticket (`docs/tickets/NN-*.md`):** Defines approved MVP scope and acceptance criteria. **Rule 2 ("No spec, no code"):** If `docs/SPEC.md` does not exist, stop before writing feature code and tell the team to run `/grill-with-docs`, then `/to-spec`.
4. **`scale-architecture/SKILL.md` (This file):** Senior-level System Design & Architecture execution rules operating strictly within `CLAUDE.md`, `CONTEXT.md`, and the active ticket.
5. **Live Repository Truth (`supabase/sql/`, `src/lib/supabase/`, `src/components/ui/`):** Always inspect the actual checked-out repository before proposing paths, queries, or edits. If a conflict occurs between any instructions, stop, explain the conflict in plain English, and ask the team to resolve it.

---

## 1. Pinned Native Stack & The Five Workshop Rules (`CLAUDE.md` & `CONTEXT.md` Section 9.3)

### 1.1 Pinned Stack (Do Not Change)
* **Frontend & Compute:** Next.js App Router (documented target: Next.js 15, React 19) + TypeScript, preserving exact versions installed in `package.json`.
* **Styling & Tokens:** Existing Tailwind CSS 4 setup mapped to semantic design tokens from `CONTEXT.md` Section 10.4.
* **UI Primitives:** Reuse existing **shadcn/ui** components in `src/components/ui/` (`Button`, `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `RadioGroup`, `Card`, `Badge`, `Table`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Sheet`, `Tabs`, `Skeleton`, `Progress`, `Tooltip`, `Breadcrumb`, `Avatar`, `Separator`, `ScrollArea`) and `lucide-react` icons.
* **Backend & Database:** Existing **HOSTED Supabase project only** (PostgreSQL, Supabase Auth, Supabase Storage, PostgREST Data API, Supavisor connection pooling, and Supabase Realtime). accessed via `src/lib/supabase/`.
* **Hosting & Delivery:** **Vercel** (every push to `main` deploys production; managed by the team leader per `CONTEXT.md` Section 14) and numbered SQL migrations in `supabase/sql/`.

> [!IMPORTANT]
> **Zero Foreign Tooling:** Never introduce Docker, local Supabase instances, self-hosted Linux VMs, Nginx/Apache, external Redis clusters, another CSS/component library, or paid third-party services. Everything must run natively on **Next.js + Vercel + Hosted Supabase**. If something outside this stack is genuinely required, stop, explain why in plain English, and wait for team approval.

### 1.2 The Five Non-Negotiable Workshop Rules
1. **Deploy First:** Confirm the app is live on Vercel before feature work. After each finished ticket, commit and push according to `CONTEXT.md` Section 14, then verify on the live/preview URL. "Works on my machine" is not done.
2. **No Spec, No Feature Code:** Check `docs/SPEC.md` before coding features. If missing, instruct the team to run `/grill-with-docs` and `/to-spec`.
3. **MVP Discipline:** Build the one user type and one core job approved in `docs/SPEC.md` (demoable in ~3 minutes). Do not silently expand scope; offer to park non-MVP ideas in `docs/LATER.md`.
4. **Security Baseline (Mandatory Even for Demos):**
   * Row Level Security (RLS) is **ON** for every Supabase table with explicit policies.
   * Never place a Supabase `service_role` key or `sb_secret_` key anywhere in the project or browser.
   * Only the Supabase URL and publishable (`anon`) key may use `NEXT_PUBLIC_` variables.
   * `.env.local` is never committed.
5. **Teach As You Go:** After every change, explain in 2–3 plain-English sentences what changed and why. Define technical jargon the first time it is used.

---

## 2. Existing Codebase Preservation & Non-Destructive Evolution

Because the **Dugtong OJT** system is already built and running on the shared project laptop (`CONTEXT.md` Section 12.5):

1. **Do Not Rewrite or Re-Scaffold the App:**
   * Preserve existing routes in `src/app/`, components in `src/components/`, and Supabase client utilities in `src/lib/supabase/`.
   * Never rename working routes, delete existing role files, or reorganize the folder tree unless explicitly instructed by an approved ticket.
2. **Stop-and-Ask Boundaries (`CONTEXT.md` Section 15):**
   * Always get explicit team approval before changing Supabase schemas, migrations, RLS policies, auth/session behavior, storage rules, server-side permissions, API/data contracts, or generated types.
   * During a UI/design-only pass, never alter database tables, RLS policies, or backend contracts (`CONTEXT.md` Section 10.1 & 10.9).
3. **Non-Breaking Schema Evolution (Expand -> Migrate -> Contract):**
   * When backend schema work is explicitly approved, never destructively drop or rename columns in flight. Add nullable columns/indexes/RPCs first (`expand`), update code (`migrate`), and clean up legacy fields only after team sign-off (`contract`).
4. **Windows & Shared Laptop Discipline (`CLAUDE.md` & `CONTEXT.md` Section 12.5):**
   * Provide commands compatible with Windows PowerShell and Git Bash; prefer existing `npm run` scripts.
   * Inspect `git status` and `git diff` before editing so you never overwrite a teammate's uncommitted work on the shared laptop.
   * If you hit the same error twice, stop immediately, explain what you tried and the likely cause, and ask the team before trying a third variation.

---

## 3. Team Ownership, Handoffs & Canonical Product Rules (`CONTEXT.md` Section 12)

### 3.1 Module Ownership Matrix

| Owner | Core Responsibilities & Owned Domains | Must NOT Independently Modify |
| :--- | :--- | :--- |
| **Neil Mar** *(UI/UX & Frontend Design System)* | Design tokens (`CONTEXT.md` Section 10), shared generic UI components (`src/components/ui/`), wireframes/prototype, public marketplace browsing UI, listing/search/filter presentation, evaluation report & completion certificate templates, responsive mobile (>= 375px) & desktop (<= 1440px) layouts. | Database schema/migrations, RLS, auth, roles, verification logic, marketplace/business logic, student upload, deployments, attendance/hour calculation. |
| **Khent** *(Security, Accounts & Student Protection)* | Supabase Auth integration, server-derived role verification, RLS policy review, school/company verification & private document access (short-lived signed URLs), server-side student account creation, append-only audit logs, student scope acknowledgment, student reports/appeals. | Marketplace & partnership business logic, upload parsing/deployments/attendance logic, shared visual design system. |
| **Josiah** *(Marketplace, Partnerships, Evaluations & Admin)* | Company listings (mandatory scope of tasks), school partner requests, listing search/filter data logic, partnership request rules (`requested`, `accepted`, `declined`), supervisor evaluation workflow, evaluation report & certificate data, admin dashboard UI/actions calling Khent's verification/report logic, clearly labeled fictional demo seed data. | Auth/roles/RLS design, verification/report logic, student upload/deployment/attendance/hour totals, shared visual design system. |
| **Arwin** *(School-Side OJT Tracking)* | Server-validated CSV/Excel student upload & template validation, student list/statuses, deployments (created **only** from accepted partnerships), server/database attendance & hour-total calculation, coordination with Josiah on accepted partnerships & evaluation hour inputs. | Auth/roles/RLS design, verification/audit-log mechanism, listing/partnership/evaluation business logic, shared visual design system. |

### 3.2 Canonical Workflow Rules & Unresolved Conflict Guardrails (`CONTEXT.md` Section 10.3, 12.3 & 12.4)
1. **Coordinator Deploys Students (No Student Self-Application Flow):**
   * Students do **not** self-register and do **not** have a "My Application" or student MOA-signing flow.
   * Verified schools upload students via CSV/Excel, and the **Coordinator** deploys them to accepted company partnerships.
2. **Scope of Tasks & Student Protection:**
   * Every listing **must** define its scope of tasks before publication.
   * On first login after deployment, students must prominently see and acknowledge their agreed scope of work (company, tasks, required hours/schedule).
   * Students have a discoverable report/appeal channel to flag out-of-scope work. Do not reveal the reporting student's identity to the company unless explicitly approved.
3. **Partnership Request State Machine:**
   * Either a verified school or verified company may initiate a partnership request.
   * Canonical states are strictly `requested`, `accepted`, and `declined` (unless `docs/SPEC.md` changes them).
   * **Only the receiving party may accept or decline—the sender can never accept their own request.**
4. **Supervisor Attendance vs. Coordinator Journal Approval (`CONTEXT.md` Section 12.4 Conflict #1):**
   * **Coordinators** approve student journals. Supervisors must **never** be given journal approval controls.
   * **Supervisors** record attendance and submit evaluations.
   * **Students** view read-only attendance records and submit daily journals/hour logs through supported workflows. **Do not implement student self time-in/time-out or "Location verified" features** unless the team explicitly resolves Conflict #1 in `docs/SPEC.md`.
5. **Open Decisions — Ask, Never Guess (`CONTEXT.md` Section 12.4):**
   * Do not invent role storage mechanisms (table vs. JWT claims), CSV column/size/row limits, partial-import rules, evaluation rating scales, required verification document lists, or automated report escalation/suspension rules. Check existing code/`docs/SPEC.md` first; if undecided, ask the responsible owner.

---

## 4. Mapping All 7 Engineering Skill Pillars to Dugtong OJT

This section translates classic software engineering and Laravel/enterprise backend patterns directly into Dugtong OJT's native **Next.js App Router + Hosted Supabase + Vercel** stack:

| Engineering Pillar | Core Engineering Skills | Native Dugtong OJT Execution (Next.js + Hosted Supabase + Vercel) |
| :--- | :--- | :--- |
| **1. Software Architecture** | MVC, Service Layer, REST API, Repository Pattern, SOLID, Separation of Concerns, Scalable Design | • **View:** Generic props-driven UI in `src/components/ui/` + role screens in `src/app/`.<br>• **Controller:** Next.js Server Actions & Route Handlers verifying session & validating input.<br>• **Service & Repository:** Domain rules & typed Supabase queries in `src/lib/` / feature modules.<br>• **Stateless Design:** Zero in-memory server state; horizontally scalable on Vercel. |
| **2. Database Engineering** | DB Design, Relational Modeling, Normalization, SQL Optimization, Indexing, Transactions, FKs/Constraints, Migrations, Concurrency, Pagination | • **Normalized Schema:** Relational tables in `supabase/sql/` with strict Foreign Keys, `CHECK`, and `UNIQUE` constraints.<br>• **Transactions & Concurrency:** Atomic PostgreSQL triggers and PL/pgSQL RPC functions (`supabase.rpc()`) with row-level locking.<br>• **Pagination:** Functional pagination (`CONTEXT.md` 10.7) using Keyset/Cursor pagination on high-volume tables. |
| **3. DevOps & Deployment** | CI/CD, GitHub Actions, Environment Config, Production Deployment, Web Server/Edge, DNS, SSL/HTTPS, Logging & Monitoring | • **Zero-Docker Native Delivery:** Automated Vercel Preview & Production deployments via GitHub (`main` managed by team lead; `neil` branch workflow in Section 14).<br>• **Edge & SSL:** Vercel Edge Network provides global CDN, automatic SSL/HTTPS, and WAF.<br>• **Observability:** Supabase Query Performance (`pg_stat_statements`), Vercel logs, and append-only audit logs. |
| **4. Backend Engineering** | Auth & Authorization, RBAC, Laravel Policies mindset, Form Request Validation, Rate Limiting, Caching, Queues/Jobs, APIs, File Uploads, Notifications | • **Auth & Policies:** Supabase Auth (`auth.getUser()`) + server-derived RBAC + PostgreSQL **Row Level Security (RLS)** acting as database-enforced Laravel Policies.<br>• **Form Request Validation:** Server-side **Zod** schema validation & CSV row-level validation.<br>• **File Uploads:** Private Supabase Storage buckets accessed via short-lived server-generated Signed URLs (`createSignedUrl`). |
| **5. Security** | OWASP, IDOR/BOLA, CSRF, XSS, SQL Injection, Mass Assignment, Secure Auth, Access Control, Input Validation | • **IDOR/BOLA Prevention:** Dual enforcement via Server checks + Supabase RLS tenant checks (`school_id`, `company_id`, `student_id`).<br>• **SQLi & Mass Assignment:** Parameterized Supabase client queries (zero string concatenation) + explicit Zod field whitelisting.<br>• **CSRF & XSS:** Next.js Server Action Origin checks, React automatic escaping, and strict secret hygiene. |
| **6. Performance & Scalability** | Query Optimization, N+1 Prevention, DB Indexing, App Caching, Load Optimization, Lazy/Eager Loading, Horizontal Scaling | • **N+1 Prevention:** Single-roundtrip relational selects (`select('*, companies(*)')`).<br>• **Indexing:** B-Tree on all FKs/RLS columns, `GIN` on arrays, `BRIN` on time series.<br>• **Caching & Loading:** Next.js ISR/tag caching for public listings + React Suspense & `Skeleton` states for lazy/eager loading. |
| **7. Testing & Code Quality** | Unit Testing, Feature/Integration Testing, API Testing, PHPUnit/Pest mindset, Regression Testing, Git Branching, Code Review, Debugging | • **Verification:** `npm run` lint, type-check, test, and production build checks before handoff.<br>• **Role Testing:** Verify access across all 5 roles (`visitor`, `student`, `coordinator`, `supervisor`, `admin`).<br>• **Workflow:** `/grill-with-docs` -> `/pitch` -> `/to-spec` -> `/to-tickets` -> `/implement` -> `/code-review`. |

---

## 5. Monetization & Multi-Tenant SaaS Architecture (`CONTEXT.md` Sections 6 & 11)

Dugtong OJT is a **Multi-Tenant OJT Management SaaS for Schools with a built-in Discovery Marketplace**.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        DUGTONG OJT REVENUE MODEL                       │
├──────────────────────────────────┬─────────────────────────────────────┤
│ Free Marketplace Flywheel        │ Paid School Management SaaS         │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Students (Always Free):        │ • Colleges, Universities & Tech     │
│   Browse public listings, view   │   Schools (Paying Customer):        │
│   deployment & scope, submit     │   ₱150 per student per semester or  │
│   journals, flag out-of-scope    │   tiered annual subscription.       │
│   work, view evaluations.        │   Add-on: Accreditation/Audit       │
│ • Companies (Join Free):         │   Reports (₱15,000/year).           │
│   Post OJT slots with mandatory  │   Why they renew (The Data Moat):   │
│   scope of work, request/accept  │   Every semester accumulates        │
│   school partnerships, record    │   attendance records, signed MOAs,  │
│   attendance, evaluate interns.  │   evaluations, and audit history.   │
└──────────────────────────────────┴─────────────────────────────────────┘
```

### SaaS Architectural Guardrails
1. **Multi-Tenant Isolation:** Many schools and companies share one platform, but strict RLS and server-side tenant scoping guarantee each school sees only its own students, deployments, journals, MOAs, and reports.
2. **Free Discovery Flywheel:** Student browsing, company listing publication, and school-company partnership requests remain permanently free to prevent marketplace cold-start problems (`CONTEXT.md` Section 6.1 & 7.1).
3. **Scope Discipline on Revenue Features (`CONTEXT.md` Section 6.2 & 12.4):** Do not invent pricing math in marketing copy or build subscription payment gateways, verified-badge billing (₱3,000/yr), or talent pipeline paywalls (₱25,000/yr) unless explicitly authorized in `docs/SPEC.md` and the active ticket.

---

## 6. Clean Layered Architecture + Direct Supabase & Real-Time Access

Dugtong OJT combines **Server-Side Supabase access** (for secure initial loads, role verification, and mutations) with **Direct Client-Side Supabase access** (for live Realtime subscriptions and authorized interactive reads), using the existing helpers in `src/lib/supabase/`.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│               NEXT.JS 15 APP ROUTER (src/app/ & src/components/)            │
│  • Generic UI Primitives: src/components/ui/ (Props-driven, zero DB calls)  │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 1. Server Reads & Secure Mutations   │ 2. Live Real-Time Data Updates       │
│ (Server Components & Server Actions) │ (Client Components - 'use client')   │
│   │                                  │   │                                  │
│   ▼                                  │   ▼                                  │
│ Server Supabase Client               │ Browser Supabase Client              │
│ (src/lib/supabase/)                  │ (src/lib/supabase/)                  │
│ - Verifies user via auth.getUser()   │ - Subscribes directly to Supabase    │
│ - Enforces server-derived role rules │   Realtime CDC (postgres_changes)    │
│ - Validates inputs (Zod / Server)    │   and Broadcast channels             │
│ - Executes queries & atomic RPCs     │ - Updates UI state or triggers       │
│                                      │   debounced router.refresh()         │
└──────────────────┬───────────────────┴──────────────────┬───────────────────┘
                   │ (HTTPS PostgREST / Supavisor Pool)   │ (WebSocket WSS)
                   ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│      HOSTED SUPABASE (PostgreSQL + RLS Policies + Audit Triggers + CDC)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities
1. **Shared UI Components (`src/components/ui/`):**
   * Strictly generic and driven by props (`CONTEXT.md` Section 12.3.1). Must never import Supabase clients or fetch data directly.
2. **Route Pages & Feature Components (`src/app/`):**
   * **Server Components:** Fetch initial role-scoped data on the server using `src/lib/supabase/` server client.
   * **Client Components (`'use client'`):** Handle interactive forms, immediate button disable/loading states, and live **Supabase Realtime** subscriptions using the browser client in `src/lib/supabase/`.
3. **Server Actions / Route Handlers (Controller & Domain Boundary):**
   * Always verify identity via `await supabase.auth.getUser()` and derive roles from trusted server-side data—never trust a role passed from the browser (`CONTEXT.md` Section 12.3.1).
   * Validate all payloads on the server (including row-level CSV/Excel upload validation for Arwin's flow).
   * Enforce canonical domain rules:
     * *Only verified companies may publish listings; only verified schools may post school partner requests.*
     * *A listing cannot be published without a defined `scope_of_tasks`.*
     * *Partnership sender cannot accept their own request (`requested` -> `accepted` / `declined`).*
     * *Deployments can only be created from an `accepted` partnership.*
     * *Running hour totals are calculated on the server/database from approved attendance records—never trust a client-supplied total.*

---

## 7. Real-Time Data Synchronization Architecture (Supabase Realtime)

Dugtong OJT tracks deployments, attendance, journals, partnerships, and evaluations in real time (`CONTEXT.md` Section 5.4):

### 1. Scoped Realtime Subscriptions by Role
When subscribing to `.channel().on('postgres_changes', ...)` in Client Components, always scope subscriptions with filters so browsers only receive relevant events:
* **Coordinator Dashboard:** Subscribe to updates on student deployments, journal submissions awaiting approval, partnership request status changes (`requested` -> `accepted`/`declined`), attendance hour updates, and escalated reports scoped to the coordinator's `school_id`.
* **Supervisor Workspace:** Subscribe to incoming school partnership requests, assigned intern deployments, and attendance/evaluation updates scoped to the supervisor's `company_id`.
* **Student Portal:** Subscribe to deployment status, scope acknowledgment status, coordinator journal approvals, supervisor-logged attendance records, and evaluation results scoped to the student's `student_id`.
* **Dugtong Admin Dashboard:** Subscribe to pending school/company verification requests and escalated student protection reports.
* **Public Marketplace:** Display active verified listings and keep available slot counts fresh via scoped Realtime events or Next.js cache revalidation.

### 2. Safe WebSocket Lifecycle & High-Traffic Broadcasts
* **Mandatory Cleanup:** Every `useEffect` that opens a Supabase Realtime channel **must** return a cleanup function calling `supabase.removeChannel(channel)` to prevent memory leaks and duplicate WebSocket listeners during route navigation.
* **Zero Full-Page Reloads:** On receiving a Realtime payload, either merge `payload.new` directly into local React state for instant feedback or call a debounced `router.refresh()` so Server Components re-fetch cleanly while preserving scroll and form state.
* **10k-Viewer Protection:** For public pages viewed by thousands of concurrent users simultaneously, prefer Next.js ISR (`revalidatePath` / `revalidateTag`) or **Supabase Realtime Broadcast** over unfiltered `postgres_changes` streams to avoid per-subscriber RLS CPU spikes.

---

## 8. The High-Concurrency Spike Scenario (Thousands of Simultaneous Clicks)

In Philippine OJT operations, massive concurrency spikes happen when thousands of users click a button at the exact same millisecond:
* **Scenario A (Partnership & Slot Rush):** Dozens of school coordinators request partnerships or deploy student batches to high-demand verified companies simultaneously.
* **Scenario B (Morning / Friday Rush):** Thousands of students submit daily journals or acknowledge scopes at 8:00 AM, while hundreds of supervisors log attendance and evaluations on Friday afternoon.
* **Scenario C (Bulk Roster Import):** Multiple coordinators upload large CSV/Excel student rosters at the start of the semester.

### 8.1 What Fails in an Unoptimized System (The Crash Chain)
1. **Accidental Double-Submits:** A user on slow mobile data clicks "Submit Journal", "Accept Partnership", or "Record Attendance" 5 times in 1 second, creating 5 duplicate database rows.
2. **Read-Then-Write Race Conditions (Lost Updates):** Two requests simultaneously read `completed_hours = 100` or `slots = 1` in JavaScript, calculate the new number in memory, and overwrite each other—corrupting student hour totals or over-allocating slots.
3. **Partial Write Corruption:** A server action updates an attendance record, but the network drops before the append-only audit log entry is written—violating audit compliance.
4. **Database Connection Starvation:** Thousands of simultaneous requests open unpooled database connections or hold transactions open during slow file parsing, crashing Postgres with `FATAL: too many connections`.

### 8.2 The Upgraded Millisecond Lifecycle (Zero Failures, Zero Duplicates)

```text
[ 1. Browser Click ] ──▶ [ 2. Edge / WAF ] ──▶ [ 3. Server Action ] ──▶ [ 4. Supavisor Pool ] ──▶ [ 5. Postgres Atomic Tx ] ──▶ [ 6. Live UI Sync ]
  • Button disables       • Flood control      • auth.getUser()         • 10,000 requests          • Row-level lock             • Realtime CDC push
  • Loading spinner       • IP rate limits     • Server validation        multiplexed into         • Server math & triggers     • revalidatePath/Tag
  • Prevents double-tap                        • Role verification        fast pooled conns        • UNIQUE & CHECK guards      • Toast feedback
```

1. **Stage 1 — Immediate Client Lock (`CONTEXT.md` Section 10.7):**
   * The moment the user clicks, the button transitions to `disabled` and displays a loading state (`useActionState` / `useFormStatus`), blocking double-clicks in the UI.
2. **Stage 2 — Vercel Edge Protection:**
   * Vercel Edge network absorbs traffic spikes and blocks automated bot floods before serverless compute is exhausted.
3. **Stage 3 — Server Validation & Role Gate:**
   * The Next.js Server Action authenticates `supabase.auth.getUser()`, verifies server-side role and organization verification status, and validates the payload (or parses CSV rows in memory before opening a DB write transaction).
4. **Stage 4 — Connection Pooling (PostgREST & Supavisor Port 6543):**
   * `@supabase/ssr` routes requests over HTTPS through Supabase's managed connection pooler (and any direct TCP connection uses Supavisor Transaction Mode on port `6543`), multiplexing thousands of concurrent spikes across a calm, fixed pool of Postgres connections.
5. **Stage 5 — Atomic PostgreSQL Execution, Locking & Constraints:**
   * **Never calculate totals or counters in client JavaScript:** Hour totals and slot decrements are computed atomically on the server/database (`SET slots = slots - 1 WHERE id = $1 AND slots > 0`).
   * **Atomic Audit Triggers:** Attendance/hour modifications and audit-log insertions (`who`, `what`, `when`, `old_value`, `new_value`) run inside the **same database transaction** via PostgreSQL triggers or `supabase.rpc()`, guaranteeing 100% tamper-evident traceability (`CONTEXT.md` Section 9.4 & 12.3).
   * **Database Uniqueness Backstop (Native Idempotency):** Even if two identical requests hit Postgres at the exact same microsecond, composite `UNIQUE` constraints (e.g., one scope acknowledgment per deployment, one active partnership request per pair, unique student roster identifiers per school) and `CHECK (slots >= 0)` physically block duplicates at the storage engine level.
6. **Stage 6 — Instant Feedback & Live Propagation:**
   * The user receives clear inline/toast feedback near the action (`CONTEXT.md` Section 10.10), while Supabase Realtime and Next.js cache revalidation update all connected dashboards.

---

## 9. Scaling to 1,000,000 Users (Database, Indexing & Caching Optimization)

When scaling Dugtong OJT to 1,000,000 users (~150k DAU, ~10k concurrent peak) across Philippine colleges, universities, and partner companies:

### 9.1 High-Performance RLS (`initPlan` Subquery Caching)
* **The 1M-User RLS Bottleneck:** Writing `USING (auth.uid() = user_id)` directly in a Row Level Security policy forces PostgreSQL to execute `auth.uid()` on *every single row* scanned.
* **The Fix (100x Speedup):** Always wrap `auth.uid()` and tenant helper functions inside a scalar `(SELECT ...)` subquery so PostgreSQL caches the value once per query via an `initPlan`:
  ```sql
  -- High-performance RLS pattern (when RLS migrations are authorized):
  USING ((SELECT auth.uid()) = user_id)
  USING (school_id = (SELECT public.current_school_id()))
  ```

### 9.2 Database Indexing Strategy (Zero Full-Table Scans)
*(Always inspect `supabase/sql/` for exact table and column names before proposing an index migration).*
1. **Foreign Key & RLS B-Tree Indexes:** PostgreSQL does not auto-index Foreign Keys. Every foreign key and tenant column (`school_id`, `company_id`, `student_id`, `listing_id`, `partnership_id`, `deployment_id`) must have an explicit B-Tree index.
2. **Partial & Composite Marketplace Indexes:** Index active verified listings by course, location, and required hours so public marketplace filtering remains sub-10ms.
3. **Array-Aware Indexes (`GIN`):** Use Generalized Inverted Indexes (`USING GIN`) on array columns (such as target courses or task scopes) for fast containment queries.
4. **High-Volume Time-Series Indexing (`BRIN` + Composite B-Tree):** For attendance logs, journals, and append-only audit tables that grow to tens of millions of rows across semesters, pair composite B-Tree indexes `(student_id, created_at DESC)` with compact Block Range Indexes (`BRIN`) on timestamp columns.

### 9.3 N+1 Query Prevention & Cursor Pagination
* **Single-Roundtrip Relational Selects:** Fetch parent and related records in a single Supabase query (`select('*, companies(*)')`) rather than running queries inside `.map()` or `for` loops.
* **Keyset / Cursor Pagination:** Avoid large `OFFSET` scans on tables with `> 1,000` rows. Use indexed keyset pagination (`WHERE (created_at, id) < (cursor_time, cursor_id) ORDER BY created_at DESC, id DESC LIMIT 20`).

### 9.4 Multi-Layer Caching Strategy (Avoiding the Next.js `cookies()` Trap)
1. **Browser Cache:** Static assets, Satoshi/Inter/JetBrains Mono fonts, and CSS bundles served with immutable headers.
2. **Public Marketplace Edge Cache:** Public visitors browse active verified listings without an account (`CONTEXT.md` Section 5.1 & 10.8). Keep public catalog queries free of unnecessary session mutations so Vercel can cache public listing views and revalidate them via `revalidatePath` / `revalidateTag` when listings change.
3. **Authenticated Role Views:** Coordinator, Supervisor, Student, and Admin screens use cookie-authenticated server clients (`src/lib/supabase/`) and render dynamically per tenant so private data never leaks across users.

---

## 10. Design System, Tokens & Frontend Architecture (`CONTEXT.md` Section 10)

Every UI component and screen must embody **Linear-level clarity and Stripe-level consistency**—calm data density, visible student protection, and audit-friendly layouts.

### 10.1 Semantic Color Tokens (`CONTEXT.md` Section 10.4)

| Token | Light Theme (Default) | Dark Theme | Architectural Usage & Contrast Guardrails |
| :--- | :--- | :--- | :--- |
| `--color-bg` | `#FFFFFF` | `#0B1220` | Main application background |
| `--color-surface` | `#F5F7FA` | `#0D1526` | Cards, subtle surfaces, and table headers (`--color-sidebar`: `#111A2E` in dark mode) |
| `--color-surface-hover` | `#EEF2F7` | `#17233A` | Restrained solid-color hover shift for rows, cards, and secondary controls |
| `--color-text` | `#0F172A` | `#F1F5F9` | Primary readable body text |
| `--color-muted` | `#596579` | `#94A3B8` | Secondary text and captions (must maintain >= 4.5:1 WCAG AA contrast) |
| `--color-border` | `rgba(15,23,42,.08)` | `rgba(59,130,246,.15)` | Crisp borders and dividers (prefer over heavy shadows) |
| `--color-primary` | `#2563EB` | `#A5C7FF` *(text)* | Primary actions (`#2563EB` -> solid `#1D4ED8` on hover; **never** use `#2563EB` as dark-mode text) |
| `--color-teal` / `-text` | `#0EA5A5` / `#086A6A` | `#3CCFCF` *(on tint)* | Never use `#0EA5A5` for small 12px text on white; use `#086A6A` on `#DDF4F4` |
| **Status Semantic Tokens** | `--color-success`: `#10B981` | `--color-warning`: `#F59E0B` | `--color-danger`: `#DC2626` (Always pair status colors with a readable text label + icon) |

### 10.2 Status Pill Pairs (Light & Dark Mode)
* **Verified:** Light `#DDF4F4` bg / `#086A6A` text | Dark `rgba(14,165,165,.18)` bg / `#3CCFCF` text
* **Pending:** Light `#FEF3D7` bg / `#8F5A06` text | Dark `rgba(245,158,11,.16)` bg / `#F5B74A` text
* **Approved:** Light `#D9F5EA` bg / `#087A55` text | Dark `rgba(16,185,129,.16)` bg / `#34D399` text
* **Rejected:** Light `#FDE4E4` bg / `#B31B1B` text | Dark `rgba(220,38,38,.18)` bg / `#F87171` text
* **Escalated:** Light `#7F1D1D` bg / `#FFFFFF` text | Dark `rgba(127,29,29,.35)` bg / `#FCA5A5` text
* **Trust Score:** Light `#E5EEFE` bg / `#1D4ED8` text | Dark `rgba(59,130,246,.18)` bg / `#A5C7FF` text

### 10.3 Typography, Layout & Interaction Rules (`CONTEXT.md` Section 10.5–10.10)
* **Typography Scale:** `H1` 32/40px, `H2` 24/32px, `H3` 18/24px (Satoshi / Inter Tight / Inter, weight 500, `-0.02em` tracking); `Body` 15/24px (Inter); `Caption` 12/16px; `Eyebrow` 12/16px uppercase (`0.08em` tracking); IDs/numeric metadata in `JetBrains Mono`. **Never use sub-12px text or oversized 44px headings.**
* **Grid & Spacing:** Max width `1440px`, 12-column desktop grid (`24px` gutters), page padding `24px` desktop / `16px` mobile. Spacing scale strictly `4, 8, 12, 16, 24, 32, 48, 64px`. Radius: cards `12px`, buttons/inputs `8px`, pills `999px`.
* **Responsive Shell:** Desktop sidebar + topbar; below `820px`, replace sidebar with working mobile navigation (`Sheet` drawer or role bottom nav)—never simply hide navigation. Test down to `375px` with zero horizontal page overflow.
* **Restrained Hover & Motion:** Use solid-color darkening only (`#2563EB` -> `#1D4ED8`, `#F5F7FA` -> `#EEF2F7`, `#0D1526` -> `#17233A`). **Never** use decorative gradients, glowing outlines, scale/bounce effects, fake charts, or dead buttons.

---

## 11. Security Baseline & Philippine Data Privacy Act (RA 10173) Compliance

Strict adherence to `CLAUDE.md` Rule 4 and `CONTEXT.md` Sections 9.4 & 12.3:

1. **Mandatory Row Level Security (RLS):**
   * Every Supabase table must have RLS enabled with explicit policies for active roles. Any table without RLS is an immediate blocker—report it and request an approved security ticket rather than silently weakening access.
2. **Strict Secret Hygiene:**
   * Never add `service_role` or `sb_secret_` keys to source files or expose secrets in client code.
   * Only the Supabase URL and publishable/anon key belong in `NEXT_PUBLIC_` variables. Never commit `.env.local`.
3. **Server-Side Privileged Operations:**
   * Student account creation from verified school uploads and organization verification actions must execute server-side using Khent's approved mechanism.
4. **Public Visitor Privacy Allowlist:**
   * Unauthenticated visitors browsing the public marketplace may read **only** approved public listing fields of verified active listings. Never expose student PII, internal school/company notes, private verification documents, or unapproved contact details.
5. **Private Storage & Append-Only Audit Trail:**
   * Verification documents (DTI/SEC, mayor's permit, MOAs) live in private Supabase Storage buckets accessed strictly via short-lived signed URLs by the owning organization or Dugtong Admin.
   * Changes to attendance, hours, evaluations, MOAs, and reports must write immutable, append-only audit logs (`actor`, `action`, `timestamp`, `old/new` values) that normal roles cannot update or delete.
   * Never log personal student data, tokens, or secrets to console output.

---

## 12. Contributor Git Workflow & Branch Discipline (`CONTEXT.md` Section 14)

Always inspect the current branch (`git branch --show-current`) and `git status` before running any Git command:

* **Branch Authority:**
  * `main` is production (managed and merged **only** by the team leader).
  * `dev` is the integration branch (merged **only** by the team leader).
  * `neil` is Neil's working branch (Neil pushes **only** to `origin/neil`).
* **Approved Sync & Push Sequence for Neil's Workflow (`CONTEXT.md` Section 14):**
  ```bash
  # 1. Sync dev and merge into neil before starting work:
  git checkout dev
  git pull origin dev
  git checkout neil
  git merge dev

  # 2. Commit and push work strictly from neil:
  git add .
  git commit -m "clear description of ticket change"
  git push origin neil
  ```
* **Strictly Prohibited Git Actions:**
  * Never push directly to `origin/dev` or `origin/main` from a contributor workflow.
  * Never merge into `dev` or `main` without the team leader.
  * Never run `git push -f` or `git push --force`.
  * If the checked-out branch does not match the expected contributor branch (e.g., sitting on a snapshot branch like `ticket-01-tokens-theme`), stop and explain the mismatch before switching, merging, or pushing.

---

## 13. Senior Engineer Pre-Flight & Definition of Done Checklist

Verify every item before and after completing a ticket (`CLAUDE.md` & `CONTEXT.md` Sections 10.11, 13, 14, 15):

- [ ] **1. Live URL & Spec Verified:** Checked live Vercel deployment and confirmed `docs/SPEC.md` + active ticket exist before writing feature code.
- [ ] **2. Repository Inspected First:** Checked existing routes, `src/lib/supabase/`, `src/components/ui/`, `package.json`, and `supabase/sql/` before making edits; zero hallucinated tables, columns, or endpoints.
- [ ] **3. Existing System Preserved:** Reused existing components and Supabase clients without breaking working routes or crossing Neil / Khent / Josiah / Arwin ownership boundaries.
- [ ] **4. Canonical Workflows Respected:** Coordinator deploys students & approves journals; Supervisor records attendance & evaluates; Student acknowledges scope & views read-only attendance; partnership sender cannot accept their own request.
- [ ] **5. Real-Time & Concurrency Safe:** Action buttons disable with loading states on click; hour totals and slot counters are calculated server/DB-side; Realtime channels clean up on unmount (`removeChannel`).
- [ ] **6. Design System & Accessibility Compliant:** Uses `CONTEXT.md` Section 10 semantic tokens, restrained solid hover states (no gradients/glows/bounces), >= 12px typography, keyboard focus, loading skeletons, empty states, and mobile navigation below `820px` down to `375px`.
- [ ] **7. Security & DPA 2012 Intact:** RLS enabled on every table; tested across `visitor`, `student`, `coordinator`, `supervisor`, and `admin` roles; zero `service_role`/`sb_secret_` keys; no student PII exposed to visitors.
- [ ] **8. Build Verified & Taught Plainly:** Ran existing `npm run` lint/type-check/build scripts, followed Section 14 Git rules, and explained what changed and why in 2–3 plain-English sentences.