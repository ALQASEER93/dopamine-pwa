import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../../lib/mongodb", () => {
  const insertOne = vi.fn(async (doc) => ({
    insertedId: "test-id",
    doc,
  }));

  const collection = () => ({
    insertOne,
  });

  const db = () => ({
    collection,
  });

  const client = {
    db,
  };

  return {
    default: Promise.resolve(client),
  };
});

vi.mock("next/server", () => {
  return {
    NextResponse: {
      json(body: unknown, init?: { status?: number }) {
        return {
          body,
          status: init?.status ?? 200,
        };
      },
    },
  };
});

// eslint-disable-next-line import/first
import { POST } from "../../app/api/visits/route";

describe("/api/visits POST", () => {
  it("returns success for a valid body", async () => {
    const request = {
      json: async () => ({
        repId: "REP_001",
        customerId: "CUST_001",
        customerName: "Test Pharmacy",
        status: "completed",
        visitType: "visit",
        notes: "Test visit",
        visitDate: new Date().toISOString(),
        elapsedSeconds: 600,
        location: {
          start: { lat: 31.95, lng: 35.93 },
          end: { lat: 31.96, lng: 35.94 },
        },
      }),
    } as any;

    const res: any = await POST(request);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
    });
    expect((res.body as any).data).toMatchObject({
      repId: "REP_001",
      customerId: "CUST_001",
      customerName: "Test Pharmacy",
      status: "completed",
    });
  });

  it("returns 400 when repId is missing", async () => {
    const request = {
      json: async () => ({
        customerId: "CUST_001",
      }),
    } as any;

    const res: any = await POST(request);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
    });
  });
});
