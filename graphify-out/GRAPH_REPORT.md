# Graph Report - DugtongOJT  (2026-10-16)

## Corpus Check
- 201 files · ~99,552 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .example 1, .csv 1)

## Summary
- 683 nodes · 1994 edges · 17 communities (15 shown, 2 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Review Actions
- Companies and Supervisors
- Dashboard and Roster Pages
- Roster Upload (Excel/CSV)
- App Config and Auth Callback
- Dependencies and Lint Config
- Evaluations and PDF Export
- MOA Documents and Uploads
- Design System and Demo Docs
- Project Rules and Skills
- Privacy and Terms Pages
- Tickets 10-25 (Reports, Listings)
- TypeScript Config
- shadcn Components Config
- Loading Skeletons
- Brand Logos
- Later Ideas List

## God Nodes (most connected - your core abstractions)
1. `getCurrentUser()` - 88 edges
2. `cn()` - 77 edges
3. `next` - 66 edges
4. `createClient()` - 36 edges
5. `react` - 32 edges
6. `Button()` - 31 edges
7. `Card()` - 27 edges
8. `CardHeader()` - 27 edges
9. `CardTitle()` - 27 edges
10. `CardDescription()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `OJT Evaluation SY2526 Google Forms Template` --conceptually_related_to--> `Dugtong OJT Product (marketplace + management SaaS)`  [AMBIGUOUS]
  templates/OJT-Evaluation-SY2526-Google-Forms.pdf → CONTEXT.md
- `AGENTS.md Next.js Agent Rules` --conceptually_related_to--> `CLAUDE.md Project Rules`  [INFERRED]
  AGENTS.md → CLAUDE.md
- `Row Level Security (RLS)` --implements--> `Security Baseline (RLS, no service_role)`  [INFERRED]
  src/lib/supabase/README.md → CLAUDE.md
- `Supabase Setup Steps` --conceptually_related_to--> `Row Level Security (RLS)`  [INFERRED]
  README.md → src/lib/supabase/README.md
- `Third-Party Licences (MIT, Matt Pocock skills)` --references--> `pitch Skill`  [EXTRACTED]
  LICENSE-THIRD-PARTY.md → .claude/skills/pitch/SKILL.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Workshop skill pipeline (grill, pitch, spec, tickets, implement, review)** — claude_skills_grill_with_docs_skill, claude_skills_pitch_skill, claude_skills_to_spec_skill, claude_skills_to_tickets_skill, claude_skills_implement_skill, claude_skills_code_review_skill [EXTRACTED 0.95]
- **Project guidance authority chain** — claude_md, context_md, claude_skills_scale_architecture_skill [INFERRED 0.85]
- **Core hours tracking flow** — docs_spec_roster, docs_spec_student, docs_spec_approval, docs_spec_report, docs_spec_cert [INFERRED 0.85]
- **Misuse report lifecycle: report, escalate, appeal** — docs_tickets_11_misuse_reporting, docs_tickets_17_escalate_reports_to_admin, docs_tickets_19_appeal_an_upheld_report [EXTRACTED 1.00]
- **Company verification, listing, partnership and application flow** — docs_tickets_13_company_accounts_and_admin_verification, docs_tickets_14_company_listings, docs_tickets_15_partnership_requests, docs_tickets_25_student_applications [EXTRACTED 1.00]

## Communities (17 total, 2 thin omitted)

### Community 0 - "Admin Review Actions"
Cohesion: 0.06
Nodes (78): decideAppeal(), decideEscalatedReport(), setCompanyReview(), setEmployerStatus(), setSchoolVerified(), DocumentRow, EmployerRow, EmployersCard() (+70 more)

### Community 1 - "Companies and Supervisors"
Cohesion: 0.05
Nodes (71): radix-ui, react, addCompany(), addSupervisor(), CompanyState, readMoaDates(), removeSupervisor(), updateMoa() (+63 more)

### Community 2 - "Dashboard and Roster Pages"
Cohesion: 0.08
Nodes (47): CompaniesPage(), DashboardPage(), dynamic, metadata, ROLE_WORD, shiftDay(), when(), StudentRow (+39 more)

### Community 3 - "Roster Upload (Excel/CSV)"
Cohesion: 0.08
Nodes (43): read-excel-file, dynamic, check(), importRoster(), previewRoster(), PreviewState, UploadForm(), onConfirm() (+35 more)

### Community 4 - "App Config and Auth Callback"
Cohesion: 0.07
Nodes (35): nextConfig, next, @supabase/ssr, GET(), answerApplication(), back(), createListing(), ListingState (+27 more)

### Community 5 - "Dependencies and Lint Config"
Cohesion: 0.04
Nodes (45): eslintConfig, dependencies, class-variance-authority, clsx, html2canvas-pro, jspdf, lucide-react, next (+37 more)

### Community 6 - "Evaluations and PDF Export"
Cohesion: 0.09
Nodes (27): html2canvas-pro, jspdf, dynamic, EvaluationPage(), applyToListing(), back(), dynamic, MyCertificate (+19 more)

### Community 7 - "MOA Documents and Uploads"
Cohesion: 0.10
Nodes (32): recordMoaDocument(), MoaUploader(), onFile(), DocumentState, recordDocument(), ApplicationsCard(), DocumentUploader(), onFile() (+24 more)

### Community 8 - "Design System and Demo Docs"
Cohesion: 0.08
Nodes (34): 15-Minute Demo Script, Accessibility and Interaction Quality, UI Implementation Guardrails, Product Roles and Canonical Workflows, shadcn/ui Components, Design Tokens, Three-Minute Session 1 Pitch, OJT Hours Paperwork Problem (+26 more)

### Community 9 - "Project Rules and Skills"
Cohesion: 0.08
Nodes (32): AGENTS.md Next.js Agent Rules, Five Workshop Rules, CLAUDE.md Project Rules, Pinned Stack (Next.js, Tailwind, Supabase, Vercel), Security Baseline (RLS, no service_role), code-review Skill, Two-Axis Review (Spec vs Safety and Standards), Design Tree Interview and Problem Bar (+24 more)

### Community 10 - "Privacy and Terms Pages"
Cohesion: 0.09
Nodes (19): lucide-react, metadata, metadata, BADGE, DtrSample(), ROWS, AUDIENCES, Landing() (+11 more)

### Community 11 - "Tickets 10-25 (Reports, Listings)"
Cohesion: 0.13
Nodes (20): Ticket 10: Supervisor logins and approval of hours, Misuse report status flow (submitted, upheld, not_upheld), Ticket 11: Misuse reporting, Ticket 12: Evaluation rating and report, Admins table and admin role, Ticket 13: Company accounts and admin verification, Ticket 14: Company OJT listings, Offline partner (MOA-based accepted partnership) (+12 more)

### Community 12 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 13 - "shadcn Components Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 15 - "Brand Logos"
Cohesion: 0.67
Nodes (4): Dugtong OJT wordmark logo (light variant), Dugtong OJT wordmark logo (dark variant), Interlocking squares mark (dark-mode colors), Two interlocking rounded squares with teal dot (symbol)

## Ambiguous Edges - Review These
- `Dugtong OJT Product (marketplace + management SaaS)` → `OJT Evaluation SY2526 Google Forms Template`  [AMBIGUOUS]
  templates/OJT-Evaluation-SY2526-Google-Forms.pdf · relation: conceptually_related_to
- `Ticket 10: Supervisor logins and approval of hours` → `Ticket 23: Dashboard paging`  [AMBIGUOUS]
  docs/tickets/23-dashboard-paging.md · relation: conceptually_related_to

## Knowledge Gaps
- **168 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 192 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Dugtong OJT Product (marketplace + management SaaS)` and `OJT Evaluation SY2526 Google Forms Template`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Ticket 10: Supervisor logins and approval of hours` and `Ticket 23: Dashboard paging`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `next` connect `App Config and Auth Callback` to `Admin Review Actions`, `Companies and Supervisors`, `Dashboard and Roster Pages`, `Roster Upload (Excel/CSV)`, `Dependencies and Lint Config`, `Evaluations and PDF Export`, `MOA Documents and Uploads`, `Privacy and Terms Pages`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `cn()` connect `Companies and Supervisors` to `Admin Review Actions`, `Roster Upload (Excel/CSV)`, `MOA Documents and Uploads`, `Privacy and Terms Pages`, `Loading Skeletons`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `getCurrentUser()` connect `Admin Review Actions` to `Companies and Supervisors`, `Dashboard and Roster Pages`, `Roster Upload (Excel/CSV)`, `App Config and Auth Callback`, `Evaluations and PDF Export`, `MOA Documents and Uploads`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Review Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.05965858041329739 - nodes in this community are weakly interconnected._