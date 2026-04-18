# Task Manager

A fullstack task manager built with React + TypeScript (frontend) and Express + TypeScript (backend). All data lives in-memory — no database needed.

---

## Project Structure

```
task-manager/
├── backend/
│   └── src/
│       ├── index.ts    # Express entry point (port 3001)
│       ├── routes.ts   # REST handlers
│       ├── store.ts    # In-memory storage + CRUD
│       └── types.ts    # Task / Priority types
│
└── frontend/
    └── src/
        ├── main.tsx    # React entry
        ├── App.tsx     # UI + state
        ├── App.css     # Component styles
        ├── index.css   # Global styles / CSS vars
        └── api.ts      # Typed fetch client
```

---

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev        # http://localhost:3001
```

### Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

---

## REST API

| Method | Endpoint   | Body                                          | Description               |
| ------ | ---------- | --------------------------------------------- | ------------------------- |
| GET    | /tasks     | —                                             | List all tasks            |
| POST   | /tasks     | `{ title, priority?, dueDate? }`              | Create a task             |
| PATCH  | /tasks/:id | `{ completed?, title?, priority?, dueDate? }` | Update any field(s)       |
| DELETE | /tasks/:id | —                                             | Delete one task           |
| DELETE | /tasks     | —                                             | Clear all completed tasks |

---

## Task Shape

```ts
interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null; // "YYYY-MM-DD"
  createdAt: string; // ISO timestamp
}
```

---

## Features

- ✅ Add task with **priority** (low / med / high) and optional **due date**
- ✅ Toggle completion via checkbox
- ✅ **Inline edit** — double-click any task title to edit, Enter/blur to save
- ✅ Delete individual tasks
- ✅ Filter: All / Active / Completed
- ✅ Sort by: Created / Priority / Due date
- ✅ Overdue / today / soon **due date badges**
- ✅ Colour-coded priority left-border on each task
