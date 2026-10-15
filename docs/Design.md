# Dugtong OJT â€” UI Design & Frontend Agent Guide

**Owner:** UI/UX Lead  
**Product:** OJT management SaaS and verified-company marketplace for Philippine schools  
**Version:** 1.3  
**Updated:** October 15, 2026

## Mission

Build a polished, credible, accessible platform for schools, companies, and students. Prioritize trust, clear workflows, audit-friendly information, calm data density, and visible student protection. Aim for Linear-level clarity and Stripe-level consistencyâ€”not a generic AI dashboard, decorative gradients, flashy hover effects, or oversized cards.

## 1. Non-negotiable implementation guardrails

- Use the existing **Next.js + React + TypeScript + Supabase** project. Follow installed versions, routing, styling, Supabase clients, generated types, and component conventions. Do not create a standalone HTML prototype.
- Inspect before editing: routes, components, auth/session flow, Supabase queries, generated types, schema, Row Level Security (RLS), `package.json`, Tailwind version, `components.json`, and existing `components/ui` files.
- This is primarily a design and frontend task. Do not casually change Supabase tables, migrations, RLS policies, authentication, server actions, API contracts, relationships, or business rules to make a screen easier to build.
- Reuse existing Supabase clients and authorized data-access paths. Never expose service-role keys in client code or bypass RLS. Keep privileged operations server-side.
- Do not replace live data with hardcoded demo data, remove features, invent endpoints, or make controls appear functional when they are not. If backend support is missing, report the dependency instead of faking it.
- Keep changes scoped and preserve working behavior, permissions, routing, and existing styling conventions.

## 2. Component implementation: shadcn/ui

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

## 3. Product roles and canonical workflows

Use one consistent design system with role-aware navigation and actions.

- **Coordinator (school):** imports/manages students, deploys students to placements, requests partnerships, approves journals, monitors hours and attendance, reviews evaluations, tracks MOA expiry, and generates reports.
- **Supervisor (company):** manages company listings and scope of work, accepts/declines partnership requests, views assigned interns, logs attendance, submits evaluations, and views company trust information. **Does not approve journals.**
- **Student:** browses public listings, views assigned deployment and hours, acknowledges the agreed scope of work on first login, submits journals/hour logs only through supported workflows, views attendance, and accesses report/appeal options.
- **Dugtong Admin:** verifies schools and companies, reviews escalated reports/appeals, monitors activity and trust scores, and uses existing moderation/suspension controls.
- **Public visitor:** browses verified company listings without an account. Require sign-in only when the actual workflow needs it.

### Workflow rules

1. The Coordinator deploys students. Do not invent a student â€œMy Applicationâ€ process or student MOA-signing flow.
2. On first login after deployment, prominently show the actual scope of work for acknowledgment. Show company, tasks, required hours/schedule, acknowledgment action, and recorded status/date when supported by real data.
3. The Supervisor records attendance. The student attendance view is for viewing records/status. Do not add student self time-in/time-out or â€œLocation verifiedâ€ unless explicitly supported by product requirements and backend.
4. The Coordinator approves journals. Supervisor screens focus on attendance, evaluations, assigned interns, listing/scope management, and partnership decisions.
5. Make the student report/appeal channel discoverable from placement and scope-of-work screens. Follow the existing escalation flow; do not invent outcomes or status transitions.
6. Do not invent application document requirements, such as medical certificates or parent consent. Display only requirements supported by actual product rules and data.

## 4. Design tokens

Define tokens centrally using the project's existing CSS/theme setup. Use semantic names in components; map them to Tailwind `@theme` only if the installed project uses Tailwind v4. Do not scatter raw hex values through component styles.

### Light theme (default)

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

### Dark theme

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

### Status colors

Always pair a status color with a readable label and, where useful, an icon. Check contrast in the rendered theme.

| Status | Light background / text | Dark background / text |
|---|---|---|
| Verified | `#DDF4F4` / `#086A6A` | `rgba(14,165,165,.18)` / `#3CCFCF` |
| Pending | `#FEF3D7` / `#8F5A06` | `rgba(245,158,11,.16)` / `#F5B74A` |
| Approved | `#D9F5EA` / `#087A55` | `rgba(16,185,129,.16)` / `#34D399` |
| Rejected | `#FDE4E4` / `#B31B1B` | `rgba(220,38,38,.18)` / `#F87171` |
| Escalated | `#7F1D1D` / `#FFFFFF` | `rgba(127,29,29,.35)` / `#FCA5A5` |
| Trust score | `#E5EEFE` / `#1D4ED8` | `rgba(59,130,246,.18)` / `#A5C7FF` |

### Contrast rules

- Target WCAG 2.1 AA: at least 4.5:1 for normal text and 3:1 for large text and meaningful UI boundaries/graphics.
- Never use primary blue `#2563EB` as text on dark backgrounds; use the accessible light tint.
- Never use `#0EA5A5` for 12px text on white or as a white-text button fill. Use `#086A6A` for small verified text on pale teal, or use teal as an accent with a compliant foreground.
- Muted text must meet 4.5:1 for normal text. Validate all status pairs in both themes.
- Focus indicators must be visible in light and dark modes. Color alone must never communicate state.

## 5. Typography

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

## 6. Layout and shell

- Maximum content width 1440px; 12-column desktop grid; 24px gutters.
- Page padding: 24px desktop, 16px mobile.
- Spacing scale only: 4, 8, 12, 16, 24, 32, 48, 64px.
- Radius: cards 12px; buttons/inputs 8px; pills 999px.
- Shadow: `0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.05)`. Prefer borders and surface contrast over heavy shadows.
- Desktop shell: consistent sidebar and topbar. Every authenticated page has a page title, useful breadcrumb where relevant, and one role-appropriate primary action when an action exists.
- Below 820px, replace the desktop sidebar with working mobile navigation (drawer or role-appropriate bottom navigation); never simply hide navigation.
- Test at 375px, tablet, and desktop. Prevent page-level horizontal overflow. Tables must use contained horizontal scrolling or a deliberate mobile row/card treatment.

## 7. Shared component requirements

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

## 8. Role-specific screen guidance

- **Coordinator dashboard:** KPIs, student deployment/progress table, journal approval queue, partner summaries, MOA expiry alerts, and recent activity. Journal approval belongs here.
- **Supervisor workspace:** assigned interns, attendance logging, evaluation forms, listing/scope management, and partnership request decisions. Do not place journal approval actions here.
- **Student portal:** deployment details, required/completed hours, agreed scope, journal/hour-log workflows supported by the backend, read-only attendance records, authorized evaluation visibility, and a clear report/appeal entry point. Scope acknowledgment must be prominent; show recorded status/date when available.
- **Dugtong Admin:** verification requests, escalated reports/appeals, trust oversight, and platform controls already supported by the application.
- **Public marketplace:** browse without an account; show company verification, role, scope summary, relevant course, hours/schedule, location/work setup, slots, and trust information only when real data exists.

## 9. Supabase and data integrity

- Use the existing Supabase integration and typed data access. Follow current auth/session handling and server/client boundaries.
- During a design-only pass, preserve schema, migrations, RLS policies, auth configuration, storage rules, and business logic. Do not add tables, alter policies, or change queries unless backend work is explicitly authorized.
- Never place service-role credentials in browser code. Use public client configuration only where intended; privileged operations stay server-side.
- UI visibility is not authorization. Respect server-side permissions and RLS; never rely only on hiding a button.
- Do not fabricate trust scores, verified status, attendance/location checks, application documents, MOA signatures, report outcomes, or audit records.
- If a screen depends on missing backend behavior, build only the UI supported by existing fields and report the missing dependency to the lead. Do not simulate a successful save.

## 10. Accessibility and interaction quality

- Use semantic React components, keyboard support, visible `:focus-visible`, accessible names for icon-only actions, and logical focus order.
- Preserve shadcn component accessibility behavior; do not remove labels, ARIA attributes, focus management, or keyboard interaction to simplify styling.
- **Hover behavior:** Use subtle, solid-color darkening as the default interaction cue. On light surfaces, shift toward a slightly darker neutral (`#F5F7FA` â†’ `#EEF2F7`); on dark surfaces, use a restrained surface shift (`#0D1526` â†’ `#17233A`) while preserving the dark appearance. For outlined controls, slightly strengthen the border and darken the surface. For cards and table rows, use a subtle background/border changeâ€”not a glow or large shadow. Keep hover distinct from active, selected, disabled, and focus-visible states. Never use gradients for hover.
- Use short, restrained transitions for color, background-color, and border-color only; respect `prefers-reduced-motion`. Avoid scaling, bouncing, animated gradients, glowing outlines, or dramatic movement.
- Keep feedback near the action that caused it. Preserve form state on recoverable errors where possible.
- Every visible control must have a real outcome. No dead buttons, fake sorting, fake charts, decorative filters, or links without destinations.
- Use concise professional copy and Philippine OJT terms consistently. Format dates, hours, and IDs clearly.

## 11. Definition of done

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

