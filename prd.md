# PRD.md — Company Calendar & Operations Platform

## 1. Introduction

### 1.1 Overview
This platform is an internal, all-in-one **Calendar + Operations Hub** for the company. It replaces scattered spreadsheets, WhatsApp reminders, and manual follow-ups with one system where Admins, Mentors, and Employees can schedule **Classes**, **Demo Classes**, and **Tasks**, manage a **Client Database**, and control everything through a secure **Admin Panel** — all on a single, drag-and-drop, animated calendar.

### 1.2 Problem Statement
- Class/demo timings are managed manually (calls, chats) → missed sessions, mentor no-shows.
- No automated reminder system → mentors forget upcoming classes.
- Task assignment and productivity tracking for employees (video/post/content work) is informal → no accountability or time-to-complete data.
- Client history (what work was done, when, for whom) is not centralized → repeated questions, lost context.
- No single admin view to manage users, clients, and permissions.

### 1.3 Vision
A **premium, fast, single-server Node.js system** that feels like a mix of Google Calendar + Notion + Linear — beautiful, animated, drag-and-drop scheduling, with automated email/reminder workflows and a clean admin control center.

### 1.4 Goals & Objectives
| Goal | Success Signal |
|---|---|
| Centralize scheduling | 100% of classes/demos created in-app, 0 manual reminders |
| Automate reminders | Mentors get email 1 hour before every class/demo automatically |
| Track productivity | Every task has estimated time vs. actual time logged |
| Centralize client history | Every client has a full transaction/work log |
| Secure role-based access | Admin-only controls for client + user management |

---

## 2. Target Audience / User Personas

1. **Super Admin / Admin** — Owns the system. Adds clients, mentors, employees; edits everything; manages own profile.
2. **Mentor** — Gets tagged to Classes/Demo Classes; receives email + reminder 1 hour prior; views only their own schedule.
3. **Employee (Content/Ops)** — Gets tasks assigned (video, post, both, other); tracks time-to-complete; works against client names.
4. **Sales/Counselor (optional future role)** — Adds demo class attendees (students), tracks conversion.

---

## 3. Features

### 3.1 Calendar (Core)
- Month / Week / Day / Agenda views.
- Drag-and-drop to reschedule any event (class, demo, task deadline).
- Color-coded by category (Class / Demo / Task / Meeting).
- Click-to-create, resize-to-extend duration.
- Smooth animated transitions between views.

### 3.2 Class Module
- Fields: Course name, Batch (optional), Date/Time, Duration, Mentor (tag from mentor list).
- Auto email to mentor on creation + auto reminder **1 hour before** start time.
- Recurring class support (weekly batch schedule).

### 3.3 Demo Class Module
- Fields: Mentor (tag + email + reminder), Date/Time, list of **Student Names/Contacts** attending.
- Same 1-hour-before reminder logic as Class.
- Demo outcome field (Converted / Follow-up / Not Interested) for future CRM linkage.

### 3.4 Task Module (Productivity Tracker)
- Fields: Task name, Priority (Low/Medium/High/Urgent), Estimated time to complete, Client (select from Client Database), Work type (Video / Post / Both / Other), Notes.
- Status flow: To Do → In Progress → Review → Done.
- Actual time logged vs estimated time → productivity variance report per employee.

### 3.5 Client Database
- Client profile: Name, Contact, Company, Industry, Onboarding date, Status (Active/Inactive).
- **Transaction/Work Log**: every Task linked to a client automatically appears as a timeline entry on that client's profile (what was done, by whom, when).
- Searchable, filterable client list.

### 3.6 Admin Panel
- Admin-only: Add/Edit/Delete clients, mentors, employees.
- Role & permission management.
- Admin profile with editable profile picture, name, contact.
- Activity log (who created/edited what).

---

## 4. Use Cases

| # | Actor | Use Case |
|---|---|---|
| UC1 | Admin | Creates a new Batch Class, tags Mentor A → Mentor A gets email now + reminder at T-1hr |
| UC2 | Admin/Sales | Schedules a Demo Class, tags Mentor B, adds 3 student names |
| UC3 | Admin | Assigns a Task "Edit Instagram Reel" (Priority: High, Est: 3 hrs) to Employee C for Client X |
| UC4 | Employee | Opens their task board, updates status, logs actual time spent |
| UC5 | Admin | Opens Client X's profile → sees full history of tasks/work delivered |
| UC6 | Admin | Adds a new Client, uploads company logo, adds notes |
| Admin | Admin | Edits own profile picture + info in Admin Panel |
| UC7 | Mentor | Receives reminder email 1 hour before class, clicks link to join |
| UC8 | Admin | Drags a class from Tuesday to Wednesday on the calendar — reminders auto re-scheduled |

---

## 5. Audience
- Internal company staff only (not public-facing).
- Roles: Admin, Mentor, Employee (extensible to Sales/HR later).
- Expected scale: small-to-mid team (10–200 users), multiple daily classes/tasks.

---

## 6. Tech Stack

### 6.1 Application Layer (single Node.js server)
- **Backend**: Node.js + Express (or NestJS for stronger SOLID/DI structure) — REST + WebSocket (for real-time drag-drop sync & notifications).
- **Frontend**: Server-rendered from the same Node process using **Next.js** (or EJS/React SPA bundled and served by Express) — keeps "one server" requirement while still giving a modern component-based UI.
- **Real-time**: Socket.io for live calendar updates across users.
- **Job Queue / Reminders**: BullMQ + Redis (or node-cron for smaller scale) for the "1 hour before" email trigger.
- **Email**: Nodemailer + SMTP (or SendGrid/Resend API).

### 6.2 Database Strategy (polyglot, purpose-fit)
| Store | Technology | Purpose |
|---|---|---|
| **Primary SQL** | Supabase (Postgres) | Source of truth: Users, Roles, Classes, DemoClasses, Tasks, Clients, Transactions — relational integrity, RLS for role security |
| **Graph (optional, Phase 2+)** | Neo4j | Relationship intelligence: Mentor↔Batch↔Student↔Client webs, "who worked with which client how often," referral/conversion graphs |
| **Vector DB (optional, AI layer)** | Chroma or FAISS (self-hosted, free) — Pinecone as managed alternative | Semantic search over task notes, client notes, meeting notes; future AI assistant ("show me all tasks like this one") |
| **Cache** | Redis | Session cache, job queue, rate limiting |

> **Why this mix**: Postgres/Supabase handles all transactional, relational data (fast, reliable, has built-in Auth + Row Level Security which fits role-based access perfectly). Neo4j is optional and only justified once relationship-mining (e.g., "which mentor's students convert best") becomes a real need. The Vector DB is optional and only needed if/when an AI search or assistant feature is added — starting with **Chroma (free, embeddable, no separate infra)** is the pragmatic choice over Pinecone (paid SaaS) unless scale demands it.

### 6.3 Auth & Security
- Supabase Auth (JWT-based) or custom Passport.js + JWT.
- Role-Based Access Control (RBAC): Admin / Mentor / Employee.
- Row Level Security in Postgres for data isolation.

### 6.4 Frontend Libraries
- **FullCalendar.js** or a custom React calendar built on **dnd-kit** for drag-and-drop.
- **Framer Motion** for premium animations/transitions.
- **TailwindCSS** + shadcn/ui for consistent, modern design system.

### 6.5 DevOps
- Single Node.js server (Express/Next.js combined) deployable on Railway/Render/VPS.
- Supabase hosted Postgres (managed).
- GitHub Actions CI/CD.

---

## 7. Non-Functional Requirements
- **Performance**: Calendar loads < 1s for a month view with 500+ events.
- **Reliability**: Reminder emails must fire within ±2 minutes of the 1-hour mark.
- **Security**: All client data access is role-gated; Admin-only for CRUD on Clients/Users.
- **Scalability**: Architecture supports scaling to multi-tenant (multiple companies) in future.
- **Maintainability**: Codebase follows SOLID principles (see architecture.md) for long-term extensibility.

---

## 8. Assumptions & Constraints
- Single company/tenant for v1 (multi-tenant is a future phase).
- Email is the primary reminder channel for v1; SMS/WhatsApp reminders are a future enhancement.
- All users are internal — no public self-signup; Admin provisions accounts.

## 9. Out of Scope (v1)
- Payment/billing integration.
- Public student self-booking portal.
- Mobile native apps (responsive web only for v1).
