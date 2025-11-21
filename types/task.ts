export type TaskType = "call" | "visit" | "email" | "other";

export interface Task {
  _id: string;
  visitId?: string;
  repId: string;
  customerName: string;
  type: TaskType;
  title: string;
  notes?: string;
  dueDate: string;
  status: "open" | "done";
  createdAt: string;
  updatedAt: string;
}

