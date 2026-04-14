export type Priority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
}

export interface CreateInput {
  title: string;
  priority?: Priority;
  dueDate?: string | null;
}

export interface UpdateInput {
  completed?: boolean;
  title?: string;
  priority?: Priority;
  dueDate?: string | null;
}

const BASE = "http://localhost:3001/tasks";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getAll: (): Promise<Task[]> =>
    fetch(BASE).then((r) => handleResponse<Task[]>(r)),

  create: (input: CreateInput): Promise<Task> =>
    fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => handleResponse<Task>(r)),

  update: (id: number, patch: UpdateInput): Promise<Task> =>
    fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then((r) => handleResponse<Task>(r)),

  delete: (id: number): Promise<void> =>
    fetch(`${BASE}/${id}`, { method: "DELETE" }).then((r) =>
      handleResponse<void>(r)
    ),

  clearCompleted: (): Promise<{ deleted: number }> =>
    fetch(BASE, { method: "DELETE" }).then((r) =>
      handleResponse<{ deleted: number }>(r)
    ),
};
