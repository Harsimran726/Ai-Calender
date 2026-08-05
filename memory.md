# memory.md — AI Persistent Memory Log

> **Purpose**: This file is the single source of truth for any AI agent (or new dev) picking up this project mid-way. Before starting work, **read this file top to bottom**. After finishing any meaningful chunk of work, **append an update** — never delete history, only add.

---

## 0. How to Use This File (Instructions for AI)

1. **On session start**: Read `## Current State` and the most recent 2–3 entries in `## Phase Log` to understand where the project is.
2. **Before coding**: Cross-check `phases.md` for the active phase's Exit Criteria — do not jump ahead.
3. **On decisions**: Any architectural or design decision that deviates from `architecture.md` / `design.md` must be recorded in `## Decisions Log` with a reason.
4. **On completion of a task/phase**: Append a new entry to `## Phase Log` (never edit prior entries) using the template below.
5. **On blockers**: Log them in `## Open Questions / Blockers` so the next session doesn't repeat investigation.
6. **Never** assume prior chat context — this file is the only memory that persists across sessions.

---

| Field | Value |
|---|---|
| Active Phase | Phase 8 — End-to-End Audit & Polish |
| Last Updated | 2026-08-05 |
| Repo Status | Published to GitHub (`Ai Calender`), prototype dev mode passed and validated |
| DB Status | In-memory fallback fully active + Supabase schema ready |
| Blocking Issues | None |

---

## 2. Project Snapshot (fill in once known, keep current)
- **Repo URL**: _TBD_
- **Supabase project**: _TBD_
- **Redis instance**: _TBD_
- **Staging URL**: _TBD_
- **Production URL**: _TBD_
- **Primary contact / Admin owner**: _TBD_

---

## 3. Decisions Log
_Record any choice that diverges from or clarifies prd.md / architecture.md / design.md._

| Date | Decision | Reason | Affects |
|---|---|---|---|
| 2026-08-05 | Chose Supabase Postgres as sole DB for v1; Neo4j + Vector DB deferred to Phase 10 | Avoid over-engineering before core product is validated | architecture.md §6.2 |
| 2026-08-05 | Single Node server hosts both API and frontend (no separate frontend deploy) | Explicit requirement from stakeholder | architecture.md §1 |
| 2026-08-05 | Chose Supabase Auth for initial login/session handling | Matches the single-server + Supabase stack and reduces custom auth code | phase 1 auth |

---

## 4. Open Questions / Blockers
_Anything unresolved that the next session needs to address first._

- [ ] Confirm email provider: Nodemailer+SMTP vs. SendGrid/Resend (affects Phase 3 setup).
- [ ] Confirm if recurring classes need exceptions (skip a single occurrence) in v1 or Phase 10.
- [ ] Confirm whether "Employee" role needs to see other employees' tasks (visibility scope) or only their own.

---

## 5. Phase Log
_Append-only. One entry per work session/phase milestone. Do not edit past entries._

### [2026-08-05] Phase 0 — Kickoff
- **Done**: Authored `prd.md`, `architecture.md`, `design.md`, `phases.md`, `memory.md`.
- **Next**: Scaffold Node.js repo per architecture.md §6.1 folder structure; provision Supabase project; migrate ER schema from architecture.md §2.
- **Notes for next session**: Use the ER diagram in architecture.md §2 as the literal source for the first Postgres migration — do not redesign schema without updating architecture.md first.

### [2026-08-05] Phase 0 — Scaffold Started
- **Done**: Created a working Next.js single-server scaffold with TypeScript, Tailwind, global design tokens, a premium login page, and a dashboard shell.
- **Next**: Add Supabase client/auth wiring, then model the base Postgres schema from architecture.md §2.
- **Notes for next session**: `npm install`, `npm run typecheck`, and `npm run build` all passed on the initial scaffold.

### [2026-08-05] Phase 8 — Prototype Dev Mode Pass & GitHub Upload
- **Done**:
  - Full prototype audit and dev mode test passed successfully.
  - Added back navigation (`BackButton` component) across Profile, Users, Clients, Task Kanban, and Activity Log pages.
  - Refined Calendar into a full 4-view operational grid (Month, Week, Day, Agenda) with date range navigation.
  - Saved memory record and published initial codebase commit to GitHub repository `Ai-Calender`.
- **Repo Link**: `https://github.com/harsimran726/Ai-Calender`
- **Next**: Connect live production Supabase instance and trigger deployment pipeline.
- **Notes for next session**: Zero build errors or TypeScript warnings. Node dev server starts cleanly and all routes return 200 OK.

<!--
Template for future entries:

### [YYYY-MM-DD] Phase N — <short title>
- **Done**: ...
- **Next**: ...
- **Notes for next session**: ...
-->

---

## 6. File Map (what lives where)
| File | Purpose |
|---|---|
| `prd.md` | What we're building and why — features, personas, use cases, tech stack |
| `architecture.md` | How it's built — ER/EER diagrams, sequence/flow diagrams, SOLID structure |
| `design.md` | How it looks/feels — design tokens, component specs, page-by-page UI |
| `phases.md` | Build order — phases, deliverables, exit criteria |
| `memory.md` | This file — running memory so AI/devs never lose context between sessions |
