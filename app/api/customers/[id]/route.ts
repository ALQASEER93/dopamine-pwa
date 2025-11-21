import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import type { Customer, CustomerType } from "../../../../types/customer";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

const CUSTOMER_TYPES: CustomerType[] = [
  "pharmacy",
  "doctor",
  "hospital",
  "other",
];

function toObjectId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function serializeCustomer(doc: any): Customer {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    specialty: doc.specialty ?? undefined,
    region: doc.region ?? undefined,
    location: doc.location ?? undefined,
    createdAt: doc.createdAt?.toISOString?.() ?? "",
    updatedAt: doc.updatedAt?.toISOString?.() ?? "",
  };
}

export async function GET(
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
    const collection = db.collection("customers");

    const doc = await collection.findOne({
      _id: oid,
      deletedAt: { $exists: false },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: serializeCustomer(doc) },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/customers/[id] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load customer" },
      { status: 500 }
    );
  }
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

    if (typeof body.name === "string" && body.name.trim()) {
      update.name = body.name.trim();
    }

    if (typeof body.type === "string" && body.type.trim()) {
      const t = body.type.trim() as CustomerType;
      if (!CUSTOMER_TYPES.includes(t)) {
        return NextResponse.json(
          { success: false, error: "invalid customer type" },
          { status: 400 }
        );
      }
      update.type = t;
    }

    if (typeof body.specialty === "string") {
      update.specialty = body.specialty.trim() || undefined;
    }

    if (typeof body.region === "string") {
      update.region = body.region.trim() || undefined;
    }

    if (body.location && typeof body.location === "object") {
      const lat = Number(body.location.lat);
      const lng = Number(body.location.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        update.location = { lat, lng };
      }
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("customers");

    const result = await collection.findOneAndUpdate(
      { _id: oid, deletedAt: { $exists: false } },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: serializeCustomer(result.value) },
      { status: 200 }
    );
  } catch (err) {
    console.error("PATCH /api/customers/[id] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update customer" },
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
    const collection = db.collection("customers");

    await collection.updateOne(
      { _id: oid },
      { $set: { deletedAt: new Date() } }
    );

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/customers/[id] failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
