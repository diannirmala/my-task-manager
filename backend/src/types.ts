export type Priority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null; // ISO date string "YYYY-MM-DD" or null
  createdAt: string;      // ISO timestamp
}
