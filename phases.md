# phases.md — Project Phases & Roadmap

> Each phase lists **Goal**, **Deliverables**, **Key Tasks**, and **Exit Criteria** (what must be true before moving to the next phase). AI agents/devs should update `memory.md` at the end of every phase.

---

## Phase 0 — Planning & Foundation Setup
**Goal**: Lock scope, set up repo, environments, and design tokens.
**Deliverables**:
- Finalized `prd.md`, `architecture.md`, `design.md` (this set).
- Repo scaffolded (Node.js + Express/Next.js single-server structure per §6.1 of architecture.md).
- Supabase project created; base Postgres schema migrated from ER diagram.
- Design tokens (§2 of design.md) implemented as Tailwind config / CSS variables.
**Exit Criteria**: Repo runs locally, DB connected, login page renders with correct design tokens.

---

## Phase 1 — Auth, Users & Roles
**Goal**: Secure, role-based foundation everything else builds on.
**Key Tasks**:
- Implement Auth (Supabase Auth or JWT+Passport).
- `users` table + roles (admin/mentor/employee).
- RBAC middleware/guards.
- Admin Panel → Users CRUD (Admin-only).
- Profile settings page (edit name, picture upload).
**Exit Criteria**: Admin can log in, create a Mentor and an Employee account; each role sees a different nav/dashboard.

---

## Phase 2 — Calendar Core
**Goal**: The premium drag-and-drop calendar shell, category-agnostic.
**Key Tasks**:
- Month/Week/Day/Agenda views.
- Generic `Event` rendering (color by category).
- Drag-to-move, drag-to-resize, optimistic UI + WebSocket sync.
- Quick-create popover + full Drawer pattern.
**Exit Criteria**: A generic test event can be created, dragged, resized, and deleted smoothly with animation.

---

## Phase 3 — Class Module
**Key Tasks**:
- `courses`, `batches`, `classes` tables + CRUD API.
- Class Drawer UI (course, batch, mentor tag).
- Email-on-create integration (Nodemailer).
- BullMQ + Redis: schedule 1-hour-before reminder job.
- Reminder email template.
**Exit Criteria**: Creating a class sends an immediate email to the tagged mentor and a reminder fires ~1hr before start (test with short offset).

---

## Phase 4 — Demo Class Module
**Key Tasks**:
- `demo_classes` + `demo_attendees` tables.
- Demo Drawer UI with student add/remove chips.
- Reuse reminder engine (same `IEvent` interface as Class).
- Post-demo outcome field.
**Exit Criteria**: Demo class with 3 students created; mentor reminded; outcome can be marked after the class time passes.

---

## Phase 5 — Task Module (Productivity Tracking)
**Key Tasks**:
- `tasks` table + CRUD API.
- Kanban board UI (drag between statuses) + List view toggle.
- Priority, work type, estimated/actual time fields.
- Inline start/pause timer for actual-time logging.
- Client select (depends on Phase 6, can stub client list first).
**Exit Criteria**: Employee can create, work, and complete a task; estimated vs. actual time is visible and stored.

---

## Phase 6 — Client Database
**Key Tasks**:
- `clients` table + CRUD (Admin-only create/edit).
- Client list + detail page.
- Link `tasks.client_id` → auto-populate Task History timeline on client page.
**Exit Criteria**: Completing a task for a client shows up instantly in that client's Task History tab.

---

## Phase 7 — Admin Panel Completion
**Key Tasks**:
- Roles & Permissions management UI.
- Activity Log (audit trail of create/edit/delete actions).
- Polish Profile Settings (picture crop/upload finalized).
**Exit Criteria**: Admin has full control surface; all sensitive actions are logged.

---

## Phase 8 — Polish, Animation & QA
**Key Tasks**:
- Framer Motion pass on all transitions (drawer, drag-drop, toasts).
- Responsive pass (mobile/tablet per design.md §5).
- Accessibility audit (design.md §6).
- Cross-role QA: test every use case in prd.md §4 end-to-end.
**Exit Criteria**: All UC1–UC8 use cases pass manual QA; Lighthouse performance/accessibility score ≥ 90.

---

## Phase 9 — Deployment & Monitoring
**Key Tasks**:
- Deploy single Node server (Railway/Render/VPS) + Supabase (managed) + Redis (managed).
- Set up error monitoring (Sentry) + uptime checks.
- Backup strategy for Postgres.
**Exit Criteria**: Production URL live, reminder emails confirmed working in production, backups scheduled.

---

## Phase 10 (Future / Optional) — AI & Graph Enhancements
**Key Tasks**:
- Neo4j integration for relationship analytics (mentor performance, client referral graphs).
- Vector DB (Chroma) for semantic search across notes/tasks + AI assistant ("find similar tasks/clients").
**Exit Criteria**: Optional — only pursued once core product (Phases 0–9) is stable and adopted.

---

## Phase Tracking Table (update as you go)

| Phase | Status | Start | End | Owner |
|---|---|---|---|---|
| 0 – Planning | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 1 – Auth/Roles | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 2 – Calendar Core | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 3 – Class Module | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 4 – Demo Module | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 5 – Task Module | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 6 – Client DB | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 7 – Admin Panel | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 8 – Polish/QA | Completed | 2026-08-05 | 2026-08-05 | AI Pair |
| 9 – Deployment | Pending | | | |
| 10 – AI/Graph (optional) | Not Started | | | |
