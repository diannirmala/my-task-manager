import {
  useEffect, useState, useRef, KeyboardEvent, useCallback,
} from "react";
import { api, Task, Priority, UpdateInput } from "./api";
import "./App.css";

type Filter = "all" | "active" | "completed";
type SortKey = "created" | "priority" | "due";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABEL: Record<Priority, string> = { high: "High", medium: "Med", low: "Low" };

function dueDateStatus(dueDate: string | null, completed: boolean): "overdue" | "today" | "soon" | null {
  if (!dueDate || completed) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  const diff = (new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000;
  if (diff <= 3) return "soon";
  return null;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export default function App() {
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [input, setInput]         = useState("");
  const [priority, setPriority]   = useState<Priority>("medium");
  const [dueDate, setDueDate]     = useState("");
  const [filter, setFilter]       = useState<Filter>("all");
  const [sort, setSort]           = useState<SortKey>("created");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText]   = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const editRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getAll()
      .then(setTasks)
      .catch(() => setError("Could not connect to backend — is it running on :3001?"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  const setErr = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const addTask = async () => {
    const title = input.trim();
    if (!title) return;
    try {
      const task = await api.create({ title, priority, dueDate: dueDate || null });
      setTasks((prev) => [...prev, task]);
      setInput("");
      setDueDate("");
      setPriority("medium");
      inputRef.current?.focus();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to add task.");
    }
  };

  const patchTask = useCallback(async (id: number, patch: UpdateInput) => {
    try {
      const updated = await api.update(id, patch);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      return updated;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to update task.");
      return null;
    }
  }, []);

  const removeTask = async (id: number) => {
    try {
      await api.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to delete task.");
    }
  };

  const handleClearCompleted = async () => {
    try {
      await api.clearCompleted();
      setTasks((prev) => prev.filter((t) => !t.completed));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to clear tasks.");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
    setEditDueDate(task.dueDate || "");
    setEditPriority(task.priority);
  };

  const commitEdit = async () => {
    if (editingId === null) return;

    const title = editText.trim();

    const task = tasks.find(t => t.id === editingId);
    if (!task) return;

    // Optional: if empty → cancel edit
    if (!title) {
      setEditingId(null);
      return;
    }

    await patchTask(editingId, {
      ...task,
      title,
      priority: editPriority,
      dueDate: editDueDate || null
    });

    setEditingId(null);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTask();
  };

  const onEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingId(null);
  };

  // Filter
  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sort === "due") {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount    = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <span className="app-icon">✦</span>
        <div className="app-header-text">
          <h1 className="app-title">Tasks</h1>
          <p className="app-subtitle">
            {activeCount} remaining · {tasks.length} total
          </p>
        </div>
        <button
          className={`new-task-btn ${showForm ? "open" : ""}`}
          onClick={() => { setShowForm((v) => !v); setTimeout(() => inputRef.current?.focus(), 50); }}
        >
          {showForm ? "✕" : "+ New"}
        </button>
      </header>

      {/* ── Add Form ── */}
      {showForm && (
        <div className="add-form">
          <div className="input-row">
            <input
              ref={inputRef}
              className="task-input"
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              maxLength={120}
            />
          </div>
          <div className="add-meta-row">
            <div className="priority-picker">
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  className={`prio-chip prio-${p} ${priority === p ? "selected" : ""}`}
                  onClick={() => setPriority(p)}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
            <input
              className="date-input"
              type="date"
              value={dueDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDueDate(e.target.value)}
              title="Due date (optional)"
            />
            <button className="add-btn" onClick={addTask} disabled={!input.trim()}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          ⚠ {error}
          <button className="error-dismiss" onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* ── Controls Row ── */}
      <div className="controls-row">
        <div className="filter-row">
          {(["all", "active", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="sort-row">
          <span className="sort-label">Sort:</span>
          {(["created", "priority", "due"] as SortKey[]).map((s) => (
            <button
              key={s}
              className={`sort-btn ${sort === s ? "active" : ""}`}
              onClick={() => setSort(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Task List ── */}
      {loading ? (
        <div className="loading">Connecting to backend…</div>
      ) : sorted.length === 0 ? (
        <div className="empty">
          {filter === "completed" ? "No completed tasks yet." :
           filter === "active"    ? "Nothing left to do — nice work!" :
           "Click \"+ New\" above to add your first task."}
        </div>
      ) : (
        <ul className="task-list">
          {sorted.map((task) => {
            const dateStatus = dueDateStatus(task.dueDate, task.completed);
            const isEditing  = editingId === task.id;

            return (
              <li
                key={task.id}
                className={`task-item ${task.completed ? "done" : ""} prio-border-${task.priority}`}
              >
                {/* Checkbox */}
                <label className="task-check-label" title="Toggle complete">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => patchTask(task.id, { ...task, completed: !task.completed })}
                  />
                  <span className="task-checkmark">
                    {task.completed && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                </label>

                {/* Edit */}
                <div className="task-body">
                  {isEditing ? (
                    <div
                      className="edit-container"
                      tabIndex={-1}
                      onBlur={(e) => {
                        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                        commitEdit();
                      }}
                    >
                      <input
                        ref={editRef}
                        className="task-edit-input"
                        value={editText}
                        maxLength={120}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={onEditKey}
                      />
                      <div className="edit-fields-row">
                        <select
                          className={`edit-select prio-${editPriority}`}
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as Priority)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <input
                          className="edit-date-input"
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <span
                        className="task-title"
                        onDoubleClick={() => !task.completed && startEdit(task)}
                        title={task.completed ? "" : "Double-click to edit"}
                      >
                        {task.title}
                      </span>
                      <div className="task-meta">
                        <span className={`prio-badge prio-${task.priority}`}>
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                        {task.dueDate && (
                          <span className={`due-badge ${dateStatus ?? ""}`}>
                            {dateStatus === "overdue" ? "⚠ " : ""}
                            {formatDate(task.dueDate)}
                            {dateStatus === "today" ? " · Today" :
                             dateStatus === "overdue" ? " · Overdue" : ""}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="task-actions">
                  {!task.completed && !isEditing && (
                    <button
                      className="icon-btn edit-btn"
                      onClick={() => startEdit(task)}
                      title="Edit"
                    >
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M9.5 1.5l2 2L4 11H2v-2L9.5 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                  <button
                    className="icon-btn delete-btn"
                    onClick={() => removeTask(task.id)}
                    title="Delete"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Footer ── */}
      {completedCount > 0 && (
        <div className="footer-row">
          <button className="clear-btn" onClick={handleClearCompleted}>
            Clear {completedCount} completed
          </button>
        </div>
      )}
    </div>
  );
}
