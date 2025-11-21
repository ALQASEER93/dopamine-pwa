import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export const dynamic = "force-dynamic";

function parseNumber(value, defaultValue) {
  if (value == null) return defaultValue;
  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n) || n <= 0) return defaultValue;
  return n;
}

function buildDateRange(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return undefined;

  const range = {};

  if (dateFrom) {
    const from = new Date(dateFrom);
    if (!Number.isNaN(from.getTime())) {
      range.$gte = from;
    }
  }

  if (dateTo) {
    const to = new Date(dateTo);
    if (!Number.isNaN(to.getTime())) {
      // include the whole day for YYYY-MM-DD values
      if (
        dateTo.length === 10 &&
        !Number.isNaN(to.getTime())
      ) {
        to.setDate(to.getDate() + 1);
      }
      range.$lte = to;
    }
  }

  return Object.keys(range).length ? range : undefined;
}

function serializeVisit(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    _id: _id?.toString(),
    ...rest,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const repId = searchParams.get("repId") || undefined;
    const customerFilter = searchParams.get("customerId") || undefined;
    const status = searchParams.get("status") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const page = parseNumber(searchParams.get("page"), 1);
    const limit = Math.min(parseNumber(searchParams.get("limit"), 20), 200);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("visits");

    const query = {};
    if (repId) query.repId = repId;
    if (customerFilter) {
      // treat customerId query param as customerName search for backward compatibility
      query.customerName = { $regex: customerFilter, $options: "i" };
    }
    if (status) query.status = status;

    const dateRange = buildDateRange(dateFrom, dateTo);
    if (dateRange) {
      query.visitDate = dateRange;
    }

    const total = await collection.countDocuments(query);

    const cursor = collection
      .find(query)
      .sort({ visitDate: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const docs = await cursor.toArray();
    const data = docs.map(serializeVisit);

    return NextResponse.json(
      {
        success: true,
        data,
        page,
        limit,
        total,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/visits failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load visits",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const repId = typeof body.repId === "string" ? body.repId.trim() : "";
    const customerId =
      body.customerId != null && body.customerId !== ""
        ? String(body.customerId).trim()
        : null;
    const customerName =
      typeof body.customerName === "string" ? body.customerName.trim() : "";

    if (!repId) {
      return NextResponse.json(
        { success: false, error: "repId is required" },
        { status: 400 }
      );
    }

    if (!customerName) {
      return NextResponse.json(
        { success: false, error: "customerName is required" },
        { status: 400 }
      );
    }

    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "completed";
    const visitType =
      typeof body.visitType === "string" && body.visitType.trim()
        ? body.visitType.trim()
        : "visit";
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : "";

    let visitDate = null;
    if (body.visitDate) {
      const d = new Date(body.visitDate);
      if (!Number.isNaN(d.getTime())) {
        visitDate = d;
      }
    }

    const now = new Date();
    if (!visitDate) {
      visitDate = now;
    }

    const elapsedSeconds =
      typeof body.elapsedSeconds === "number" && body.elapsedSeconds > 0
        ? Math.floor(body.elapsedSeconds)
        : null;

    const location =
      body.location && typeof body.location === "object"
        ? {
            start: body.location.start || null,
            end: body.location.end || null,
          }
        : null;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("visits");

    const doc = {
      repId,
      customerId,
      customerName,
      visitType,
      notes,
      status,
      visitDate,
      location,
      elapsedSeconds,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);

    const saved = serializeVisit({
      _id: result.insertedId,
      ...doc,
    });

    return NextResponse.json(
      {
        success: true,
        data: saved,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/visits failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create visit",
      },
      { status: 500 }
    );
  }
}
