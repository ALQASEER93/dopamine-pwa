import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import type { Task, TaskType } from "../../../../types/task";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const TASK_TYPES: TaskType[] = ["call", "visit", "email", "other"];

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function serialize(doc: any): Task {
  return {
    _id: doc._id.toString(),
    visitId: doc.visitId ? String(doc.visitId) : undefined,
    repId: doc.repId,
    customerName: doc.customerName,
    type: doc.type,
    title: doc.title,
    notes: doc.notes ?? undefined,
    dueDate: doc.dueDate instanceof Date ? doc.dueDate.toISOString() : "",
    status: doc.status,
    createdAt:
      doc.createdAt instanceof Date ? doc.createdAt.toISOString() : "",
    updatedAt:
      doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : "",
  };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const oid = toObjectId(params.id);
    if (!oid) {
      return NextResponse.json(
        { success: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const update: any = { updatedAt: new Date() };

    if (typeof body.status === "string") {
      const s = body.status.trim();
      if (s === "open" || s === "done") {
        update.status = s;
      }
    }

    if (typeof body.title === "string" && body.title.trim()) {
      update.title = body.title.trim();
    }

    if (typeof body.type === "string" && body.type.trim()) {
      const t = body.type.trim() as TaskType;
      if (TASK_TYPES.includes(t)) {
        update.type = t;
      }
    }

    if (typeof body.notes === "string") {
      update.notes = body.notes.trim() || undefined;
    }

    if (typeof body.dueDate === "string" && body.dueDate.trim()) {
      const d = new Date(body.dueDate.trim());
      if (!Number.isNaN(d.getTime())) {
        update.dueDate = d;
      }
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("tasks");

    const result = await collection.findOneAndUpdate(
      { _id: oid, deletedAt: { $exists: false } },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: serialize(result.value) },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /api/tasks/[id] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const oid = toObjectId(params.id);
    if (!oid) {
      return NextResponse.json(
        { success: false, error: "Invalid id" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("tasks");

    await collection.updateOne(
      { _id: oid },
      { $set: { deletedAt: new Date() } }
    );

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/tasks/[id] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
