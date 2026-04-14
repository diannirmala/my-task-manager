import { Router, Request, Response } from "express";
import { getTasks, createTask, updateTask, deleteTask, clearCompleted } from "./store";
import { Priority } from "./types";

const router = Router();

const PRIORITIES: Priority[] = ["low", "medium", "high"];

// GET /tasks
router.get("/", (_req: Request, res: Response) => {
  res.json(getTasks());
});

// POST /tasks
router.post("/", (req: Request, res: Response) => {
  const { title, priority, dueDate } = req.body as {
    title?: string;
    priority?: Priority;
    dueDate?: string | null;
  };

  if (!title || title.trim() === "") {
    res.status(400).json({ error: "Title is required." });
    return;
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    res.status(400).json({ error: "priority must be low | medium | high." });
    return;
  }

  const task = createTask({ title: title.trim(), priority, dueDate });
  res.status(201).json(task);
});

// PATCH /tasks/:id
router.patch("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { completed, title, priority, dueDate } = req.body as {
    completed?: boolean;
    title?: string;
    priority?: Priority;
    dueDate?: string | null;
  };

  if (
    completed === undefined &&
    title === undefined &&
    priority === undefined &&
    dueDate === undefined
  ) {
    res.status(400).json({ error: "At least one field required." });
    return;
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    res.status(400).json({ error: "priority must be low | medium | high." });
    return;
  }

  const task = updateTask(id, { completed, title: title?.trim(), priority, dueDate });
  if (!task) {
    res.status(404).json({ error: "Task not found." });
    return;
  }
  res.json(task);
});

// DELETE /tasks/:id
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = deleteTask(id);
  if (!deleted) {
    res.status(404).json({ error: "Task not found." });
    return;
  }
  res.status(204).send();
});

// DELETE /tasks  — clear all completed
router.delete("/", (_req: Request, res: Response) => {
  const count = clearCompleted();
  res.json({ deleted: count });
});

export default router;
