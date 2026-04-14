import { Task, Priority } from "./types";

let tasks: Task[] = [
  {
    id: 1,
    title: "Build the backend API",
    completed: true,
    priority: "high",
    dueDate: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: "Wire up the frontend",
    completed: false,
    priority: "high",
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    title: "Write unit tests",
    completed: false,
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 4,
    title: "Ship it 🚀",
    completed: false,
    priority: "low",
    dueDate: null,
    createdAt: new Date().toISOString(),
  },
];

let nextId = 5;

export const getTasks = (): Task[] => tasks;

export interface CreateTaskInput {
  title: string;
  priority?: Priority;
  dueDate?: string | null;
}

export const createTask = ({ title, priority = "medium", dueDate = null }: CreateTaskInput): Task => {
  const task: Task = {
    id: nextId++,
    title,
    completed: false,
    priority,
    dueDate: dueDate ?? null,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
};

export interface UpdateTaskInput {
  completed?: boolean;
  title?: string;
  priority?: Priority;
  dueDate?: string | null;
}

export const updateTask = (id: number, patch: UpdateTaskInput): Task | null => {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, patch);
  return task;
};

export const deleteTask = (id: number): boolean => {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
};

export const clearCompleted = (): number => {
  const before = tasks.length;
  tasks = tasks.filter((t) => !t.completed);
  return before - tasks.length;
};
