import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import type { Task, TaskType } from "../../../types/task";

export const dynamic = "force-dynamic";

const TASK_TYPES: TaskType[] = ["call", "visit", "email", "other"];

function parseNumber(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return defaultValue;
  return n;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const repId = searchParams.get("repId") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    const page = parseNumber(searchParams.get("page"), 1);
    const limit = Math.min(parseNumber(searchParams.get("limit"), 20), 100);

    const query: Record<string, unknown> = {
      deletedAt: { $exists: false },
    };

    if (repId.trim()) {
      query.repId = repId.trim();
    }

    if (status === "open" || status === "done") {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      const range: Record<string, Date> = {};
      if (dateFrom) {
        const d = new Date(dateFrom);
        if (!Number.isNaN(d.getTime())) {
          range.$gte = d;
        }
      }
      if (dateTo) {
        const d = new Date(dateTo);
        if (!Number.isNaN(d.getTime())) {
          d.setDate(d.getDate() + 1);
          range.$lte = d;
        }
      }
      if (Object.keys(range).length) {
        query.dueDate = range;
      }
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("tasks");

    const total = await collection.countDocuments(query);

    const docs = await collection
      .find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const data: Task[] = docs.map((doc: any) => ({
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
    }));

    return NextResponse.json(
      { success: true, data, page, limit, total },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/tasks failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const repId =
      typeof body.repId === "string" ? body.repId.trim() : "";
    const customerName =
      typeof body.customerName === "string" ? body.customerName.trim() : "";
    const rawType =
      typeof body.type === "string" ? body.type.trim() : "";
    const type = TASK_TYPES.find((t) => t === rawType);
    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const dueDateStr =
      typeof body.dueDate === "string" ? body.dueDate.trim() : "";

    if (!repId || !customerName || !title || !dueDateStr) {
      return NextResponse.json(
        { success: false, error: "repId, customerName, title, dueDate are required" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: "invalid task type" },
        { status: 400 }
      );
    }

    const dueDate = new Date(dueDateStr);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "invalid dueDate" },
        { status: 400 }
      );
    }

    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : undefined;

    const now = new Date();

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("tasks");

    const doc: any = {
      visitId: body.visitId || undefined,
      repId,
      customerName,
      type,
      title,
      notes,
      dueDate,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);

    const data: Task = {
      _id: result.insertedId.toString(),
      visitId: doc.visitId,
      repId,
      customerName,
      type,
      title,
      notes,
      dueDate: dueDate.toISOString(),
      status: "open",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/tasks failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  }
}
