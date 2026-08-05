# design.md — Design System & Page-Level Specs

## 1. Design Philosophy
"**Premium, calm, fast.**" Inspired by Linear (speed + motion), Notion (clarity), and Google Calendar (spatial familiarity). Every interaction should feel physical — dragging an event should feel like moving a real card, not a page reload.

Principles:
1. **Clarity over decoration** — generous white space, strong hierarchy, no clutter.
2. **Motion with purpose** — animations confirm actions (drag, drop, save), never just decorate.
3. **Consistency** — one spacing scale, one type scale, one color system, reused everywhere.
4. **Role-aware UI** — Admin sees everything; Mentor/Employee see a focused, simplified view.

---

## 2. Design Tokens

### 2.1 Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0B0D12` (dark) / `#F7F8FA` (light) | App background |
| `--surface` | `#14161C` / `#FFFFFF` | Cards, modals, sidebar |
| `--surface-elevated` | `#1B1E27` / `#FFFFFF` w/ shadow | Popovers, dropdowns |
| `--primary` | `#5B5FF9` (indigo/violet) | Primary actions, active states |
| `--primary-hover` | `#4347E0` | Button hover |
| `--accent-class` | `#3DDC97` (green) | Class events |
| `--accent-demo` | `#F5A623` (amber) | Demo Class events |
| `--accent-task` | `#5B5FF9` (indigo) | Task events |
| `--accent-danger` | `#F0576B` | Urgent priority, delete actions |
| `--text-primary` | `#F5F6F8` / `#111318` | Headings, body |
| `--text-secondary` | `#9CA3AF` | Captions, meta text |
| `--border` | `#242731` / `#E5E7EB` | Dividers, card borders |

### 2.2 Typography
- Font: **Inter** (UI) / **Satoshi** (headings, optional premium feel).
- Scale: `12 / 14 / 16 / 20 / 24 / 32 / 40` px, line-height 1.4–1.5.
- Weights: 400 body, 500 labels, 600–700 headings.

### 2.3 Spacing & Radius
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Border radius: `8px` (buttons/inputs), `14px` (cards), `20px` (modals).
- Shadows: soft, layered (`0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)`).

### 2.4 Motion
- Library: **Framer Motion**.
- Standard easing: `cubic-bezier(0.22, 1, 0.36, 1)` ("ease-out-expo" feel).
- Durations: micro (120ms hover), standard (220ms modal/panel), event drag (spring, stiffness 300, damping 30).
- Drag-drop: event card lifts with shadow + slight scale (1.03) on pick-up, snaps with a subtle bounce on drop.

---

## 3. Core Components (reused everywhere)

| Component | Behavior |
|---|---|
| **EventCard** | Colored left-border by category, title, time range, mentor avatar. Hover = lift + shadow. Draggable. |
| **Modal / Drawer** | Slide-in from right for create/edit forms (Class, Demo, Task, Client). Backdrop blur. |
| **Sidebar Nav** | Icon + label, active item has pill highlight with layout animation (Framer `layoutId`). |
| **Tag/Chip** | Used for Mentor tagging, Priority, Work Type, Status. |
| **Avatar Stack** | Mentor/employee profile pictures, overlapping circles. |
| **Toast** | Bottom-right, slide+fade, used for "Reminder scheduled", "Task saved" confirmations. |
| **Empty State** | Friendly illustration + CTA when no events/tasks/clients exist. |

---

## 4. Page-by-Page Design

### 4.1 Login Page
- Centered card on gradient/mesh background (subtle animated gradient blobs, very low-key).
- Company logo, email + password, "Forgot password."
- Micro-interaction: input focus glow using `--primary`.

### 4.2 Dashboard / Calendar (Home)
- **Layout**: Left sidebar (nav: Calendar, Tasks, Clients, Admin Panel) · Top bar (view switch: Day/Week/Month/Agenda, date navigator, "+ New" button, search, profile avatar) · Main canvas = calendar grid.
- **Calendar grid**: Time-blocked columns (week/day) or month cells. Events render as `EventCard`. Drag to move, drag edge to resize duration — both update instantly (optimistic UI) then sync via WebSocket.
- **Category legend**: small colored dots (Class / Demo / Task) top-right, toggle visibility per category.
- **Create flow**: Click empty slot → quick-create popover (title + category) → "More options" expands to full Drawer form.

### 4.3 Create/Edit Class Drawer
- Fields (top to bottom): Course name (searchable select), Batch (optional select), Mentor (tag/select with avatar + email autofill), Date, Start–End time, Recurrence toggle.
- Footer: "Save" (primary) triggers confirmation toast "Mentor will be notified now + reminded 1hr before."

### 4.4 Create/Edit Demo Class Drawer
- Same as Class, plus a **Students** multi-add field (chips: name + optional phone/email, "+ Add student").
- Outcome dropdown (post-demo): Converted / Follow-up / Not Interested — shown only after class end time has passed.

### 4.5 Task Board (List + Kanban toggle)
- **Kanban view**: columns To Do / In Progress / Review / Done — cards draggable between columns (status update on drop).
- **Card**: Task name, priority pill (color-coded), client chip, work-type icon (🎥 video / 📝 post / both / other), estimated vs actual time bar.
- **Create Task Drawer**: Task name, Priority (segmented control), Estimated time (duration picker), Client (searchable select from Client DB), Work type (icon-select), Notes (rich text/textarea), Assignee.
- **Time tracking**: small inline timer/stopwatch control on the open task card ("Start" → "Pause/Done") that logs actual minutes automatically.

### 4.6 Client Database
- **List view**: Table/grid of client cards — logo/initial avatar, name, company, status pill, last activity date. Search + filter bar on top.
- **Client Detail Page**: Header (name, company, contact, status, edit button — Admin only) → Tabbed sections: **Overview** | **Task History (Transaction Log)** | **Notes**.
  - Task History renders as a vertical timeline: date, task title, who did it, work type, duration — visually similar to a git commit log / bank statement.

### 4.7 Admin Panel
- **Left sub-nav**: Users, Clients, Roles & Permissions, Profile Settings, Activity Log.
- **Users table**: Avatar, name, email, role badge, status, actions (edit/deactivate) — Admin only.
- **Profile Settings**: Circular profile picture uploader (drag-drop or click, live crop preview), name, email, password change.
- **Activity Log**: reverse-chronological feed, "Admin X created Client Y at 10:32am."

---

## 5. Responsive Rules
- Breakpoints: `sm 640` / `md 768` / `lg 1024` / `xl 1280`.
- Below `md`: sidebar collapses to bottom tab bar; calendar defaults to Agenda/Day view (month grid too dense for mobile); drawers become full-screen sheets.

## 6. Accessibility
- All interactive elements keyboard-navigable (drag-drop has keyboard fallback: select event → arrow keys to move).
- Color is never the only signal (icons/labels accompany all color-coded pills).
- Minimum contrast ratio AA (4.5:1) for text.

## 7. Design Consistency Checklist (use for every new page)
- [ ] Uses only tokens from §2 (no ad-hoc hex/spacing values)
- [ ] Uses existing components from §3 before creating new ones
- [ ] Every async action has a loading + success/error state (toast or inline)
- [ ] Every destructive action has a confirm step
- [ ] Motion follows §2.4 easing/duration standards
