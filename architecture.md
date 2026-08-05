# architecture.md — System & Data Architecture

## 1. High-Level System Architecture (2D Component Diagram)

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI[React/Next.js UI\nCalendar + Admin Panel]
    end

    subgraph Server["Single Node.js Server"]
        API[Express/Nest REST API]
        WS[Socket.io Real-time Gateway]
        JOB[BullMQ Job Scheduler\n+1hr Reminder Engine]
        AUTH[Auth Middleware\nRBAC Guard]
    end

    subgraph Data["Data Layer"]
        PG[(Postgres / Supabase\nUsers, Classes, Tasks, Clients)]
        REDIS[(Redis\nQueue + Cache)]
        NEO[(Neo4j - optional\nRelationship Graph)]
        VEC[(Chroma/FAISS - optional\nVector Search)]
    end

    subgraph External["External Services"]
        MAIL[Email Service\nNodemailer/SendGrid]
    end

    UI <--> API
    UI <--> WS
    API --> AUTH
    API --> PG
    API --> NEO
    API --> VEC
    JOB --> REDIS
    JOB --> MAIL
    JOB --> PG
    WS --> REDIS
```

**Notes**
- Everything runs from **one Node.js process/repo** (monolith) — Express serves both the API and the built frontend (or Next.js API routes), satisfying the "one server" requirement.
- BullMQ + Redis handles delayed jobs: when a Class/Demo is created, a job is scheduled for `startTime - 1hr` to send the reminder email.
- Neo4j and the Vector DB are **optional modules**, loaded only if enabled — core app works fully on Postgres alone.

---

## 2. ER Diagram (Entity-Relationship)

```mermaid
erDiagram
    USERS ||--o{ CLASSES : "mentors"
    USERS ||--o{ DEMO_CLASSES : "mentors"
    USERS ||--o{ TASKS : "assigned_to"
    USERS ||--o{ CLIENTS : "created_by"
    USERS {
        uuid id PK
        string name
        string email
        string role "admin|mentor|employee"
        string profile_picture_url
        timestamp created_at
    }

    COURSES ||--o{ CLASSES : "has"
    COURSES {
        uuid id PK
        string name
        string description
    }

    BATCHES ||--o{ CLASSES : "grouped_in"
    BATCHES {
        uuid id PK
        string batch_name
        date start_date
    }

    CLASSES {
        uuid id PK
        uuid course_id FK
        uuid batch_id FK
        uuid mentor_id FK
        datetime start_time
        datetime end_time
        boolean recurring
        string status
    }

    DEMO_CLASSES {
        uuid id PK
        uuid mentor_id FK
        datetime start_time
        datetime end_time
        string outcome "converted|followup|not_interested"
    }

    DEMO_ATTENDEES {
        uuid id PK
        uuid demo_class_id FK
        string student_name
        string student_contact
    }
    DEMO_CLASSES ||--o{ DEMO_ATTENDEES : "has"

    CLIENTS {
        uuid id PK
        string name
        string company
        string industry
        string status "active|inactive"
        uuid created_by FK
        timestamp created_at
    }

    TASKS {
        uuid id PK
        string title
        string priority "low|med|high|urgent"
        int estimated_minutes
        int actual_minutes
        string work_type "video|post|both|other"
        string notes
        uuid client_id FK
        uuid assigned_to FK
        string status "todo|inprogress|review|done"
        timestamp due_at
        timestamp created_at
    }
    CLIENTS ||--o{ TASKS : "requested"

    REMINDERS {
        uuid id PK
        string event_type "class|demo_class"
        uuid event_id
        uuid recipient_id FK
        datetime send_at
        boolean sent
    }
    USERS ||--o{ REMINDERS : "receives"
```

---

## 3. EER Diagram (Extended ER — Generalization / Specialization)

```mermaid
flowchart TB
    EVENT["EVENT (supertype)\nid, start_time, end_time, mentor_id, status"]
    CLASS["CLASS (subtype)\n+ course_id, batch_id, recurring"]
    DEMO["DEMO_CLASS (subtype)\n+ outcome, attendees[]"]

    EVENT -->|"is-a"| CLASS
    EVENT -->|"is-a"| DEMO

    USER["USER (supertype)\nid, name, email, profile_pic"]
    ADMIN["ADMIN (subtype)\n+ can manage clients/users"]
    MENTOR["MENTOR (subtype)\n+ receives class reminders"]
    EMPLOYEE["EMPLOYEE (subtype)\n+ handles tasks"]

    USER -->|"is-a"| ADMIN
    USER -->|"is-a"| MENTOR
    USER -->|"is-a"| EMPLOYEE
```

**Rationale**: `CLASS` and `DEMO_CLASS` share the same core scheduling attributes (start/end/mentor/reminder logic) — modeled as an **EVENT supertype** in the domain layer (a shared `BaseEvent` interface in code, per SOLID §5) even though physically they may be two tables or one polymorphic `events` table with a `type` discriminator column. Same pattern applies to `USER` roles.

---

## 4. Sequence Diagram — "1D" Timeline: Class Creation → Reminder → Notification

```mermaid
sequenceDiagram
    participant Admin
    participant API as API Server
    participant DB as Postgres
    participant Queue as BullMQ/Redis
    participant Mailer as Email Service
    participant Mentor

    Admin->>API: POST /classes (course, batch, mentor, time)
    API->>DB: INSERT INTO classes
    API->>Mailer: Send "You're scheduled" email now
    API->>Queue: Schedule job @ (start_time - 1hr)
    API-->>Admin: 201 Created (calendar updates via WS)

    Note over Queue: ... time passes ...

    Queue->>Mailer: Trigger reminder email
    Mailer->>Mentor: "Class starts in 1 hour"
    Queue->>DB: UPDATE reminders SET sent = true
```

---

## 5. User Flow Diagrams

### 5.1 Admin Flow
```mermaid
flowchart LR
    Login[Admin Login] --> Dash[Dashboard/Calendar]
    Dash --> A1[Create Class]
    Dash --> A2[Create Demo Class]
    Dash --> A3[Create Task]
    Dash --> A4[Open Client DB]
    Dash --> A5[Open Admin Panel]
    A1 --> Tag1[Tag Mentor → auto email+reminder]
    A2 --> Tag2[Tag Mentor + Add Students → auto email+reminder]
    A3 --> Assign[Assign Employee + Client + Priority]
    A4 --> View[View Client Profile + Task History]
    A5 --> Manage[Manage Users/Clients/Roles/Profile]
```

### 5.2 Mentor Flow
```mermaid
flowchart LR
    MLogin[Mentor Login] --> MCal[My Calendar - Classes & Demos]
    MCal --> MEmail[Receives assignment email]
    MEmail --> MRemind[Receives 1hr-before reminder]
    MRemind --> MJoin[Joins Class]
```

### 5.3 Employee Flow
```mermaid
flowchart LR
    ELogin[Employee Login] --> EBoard[Task Board]
    EBoard --> EPick[Open Task: name, priority, est. time, client]
    EPick --> EWork[Update status / log actual time]
    EWork --> EDone[Mark Done → logged to Client history]
```

---

## 6. Backend Architecture — SOLID / System Design

### 6.1 Layered Structure
```
/src
  /modules
    /calendar
      calendar.controller.ts
      calendar.service.ts
      calendar.repository.ts
      calendar.interfaces.ts
    /classes
    /demo-classes
    /tasks
    /clients
    /admin
    /reminders
      reminder.scheduler.ts   // BullMQ producer
      reminder.worker.ts      // BullMQ consumer
      reminder.strategy.ts    // interface: IReminderChannel (Email, future SMS)
  /core
    /auth        (JWT, RBAC guards)
    /events      (EventEmitter for domain events e.g. ClassCreated)
    /database    (Postgres client, Neo4j client, Vector client — behind interfaces)
  /shared
    /interfaces  (IRepository<T>, INotifiable, IEvent)
    /dto
```

### 6.2 SOLID Mapping
- **S**ingle Responsibility: Controllers only handle HTTP; Services hold business logic; Repositories only touch the DB.
- **O**pen/Closed: `IReminderChannel` interface — adding WhatsApp/SMS reminders later means adding a new class, not editing existing code.
- **L**iskov Substitution: `Class` and `DemoClass` both implement `IEvent` (start_time, end_time, mentor) and can be scheduled by the same `ReminderScheduler` interchangeably.
- **I**nterface Segregation: Separate `IEmailNotifiable`, `ITaskTrackable`, `IClientLinked` interfaces instead of one giant interface.
- **D**ependency Inversion: Services depend on `IRepository<T>` abstractions, not directly on Postgres/Supabase SDK — enables swapping DB or adding Neo4j/Vector layers without touching business logic.

### 6.3 Data Flow for Reminders (detailed)
1. Domain event `EventCreated` (Class or Demo) emitted after DB insert.
2. `ReminderScheduler` listens → calculates `sendAt = startTime - 1hr` → pushes delayed job to BullMQ.
3. `ReminderWorker` (cron-like, runs continuously) picks up due jobs → calls `IReminderChannel.send()` → currently `EmailChannel`.
4. Job result logged in `reminders` table (`sent = true/false`, retry on failure).

---

## 7. Deployment Architecture
```mermaid
flowchart LR
    subgraph VPS["Single Node Server (Railway/Render/VPS)"]
        App[Node.js App\nExpress+Next.js+Socket.io+BullMQ Worker]
    end
    App --> Supabase[(Supabase Postgres)]
    App --> RedisCloud[(Redis - managed)]
    App -.optional.-> Neo4jAura[(Neo4j Aura)]
    App -.optional.-> ChromaHost[(Chroma - self-hosted)]
    App --> SMTP[Email Provider]
```
