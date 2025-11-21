import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import type { Customer, CustomerType } from "../../../types/customer";

export const dynamic = "force-dynamic";

const CUSTOMER_TYPES: CustomerType[] = [
  "pharmacy",
  "doctor",
  "hospital",
  "other",
];

function parseNumber(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n <= 0) return defaultValue;
  return n;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseNumber(searchParams.get("page"), 1);
    const limit = Math.min(parseNumber(searchParams.get("limit"), 20), 100);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("customers");

    const query: Record<string, unknown> = {
      deletedAt: { $exists: false },
    };

    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (type && CUSTOMER_TYPES.includes(type as CustomerType)) {
      query.type = type;
    }

    const total = await collection.countDocuments(query);

    const docs = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const data: Customer[] = docs.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      type: doc.type,
      specialty: doc.specialty ?? undefined,
      region: doc.region ?? undefined,
      location: doc.location ?? undefined,
      phone: doc.phone ?? null,
      repName: doc.repName ?? null,
      comment: doc.comment ?? null,
      createdAt: doc.createdAt?.toISOString?.() ?? "",
      updatedAt: doc.updatedAt?.toISOString?.() ?? "",
    }));

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
    console.error("GET /api/customers failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load customers",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const rawType =
      typeof body.type === "string" ? body.type.trim() : "";
    const type = CUSTOMER_TYPES.find((t) => t === rawType);

    if (!name) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { success: false, error: "invalid customer type" },
        { status: 400 }
      );
    }

    const specialty =
      typeof body.specialty === "string" && body.specialty.trim()
        ? body.specialty.trim()
        : undefined;
    const region =
      typeof body.region === "string" && body.region.trim()
        ? body.region.trim()
        : undefined;

    const phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : null;
    const repName =
      typeof body.repName === "string" && body.repName.trim()
        ? body.repName.trim()
        : null;
    const comment =
      typeof body.comment === "string" && body.comment.trim()
        ? body.comment.trim()
        : null;

    let location: Customer["location"] | undefined;
    if (body.location && typeof body.location === "object") {
      const lat = Number(body.location.lat);
      const lng = Number(body.location.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        location = { lat, lng };
      }
    }

    const now = new Date();

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("customers");

    const doc: any = {
      name,
      type,
      specialty,
      region,
      location,
      phone,
      repName,
      comment,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);

    const data: Customer = {
      _id: result.insertedId.toString(),
      name,
      type,
      specialty,
      region,
      location,
      phone,
      repName,
      comment,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/customers failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create customer",
      },
      { status: 500 }
    );
  }
}
