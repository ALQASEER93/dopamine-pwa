import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { averageDurationMinutes } from "../../../lib/stats-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("visits");

    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const day = startOfToday.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = day === 0 ? 6 : day - 1; // Monday as start of week
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

    const [todayCount, weekCount, activeReps, avgDurationAgg] =
      await Promise.all([
        collection.countDocuments({
          visitDate: { $gte: startOfToday, $lt: startOfTomorrow },
        }),
        collection.countDocuments({
          visitDate: { $gte: startOfWeek, $lt: startOfTomorrow },
        }),
        collection.distinct("repId", {
          visitDate: { $gte: eightHoursAgo },
        }),
        collection
          .aggregate([
            {
              $match: {
                status: "completed",
                elapsedSeconds: { $gt: 0 },
              },
            },
            {
              $group: {
                _id: null,
                totalSeconds: { $sum: "$elapsedSeconds" },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray(),
      ]);

    let avgVisitDurationMinutes = 0;
    if (avgDurationAgg.length && avgDurationAgg[0].count > 0) {
      const { totalSeconds, count } = avgDurationAgg[0];
      avgVisitDurationMinutes = averageDurationMinutes(
        totalSeconds,
        count
      );
    }

    const data = {
      totalVisitsToday: todayCount,
      totalVisitsThisWeek: weekCount,
      activeRepsNow: Array.isArray(activeReps) ? activeReps.length : 0,
      avgVisitDurationMinutes,
    };

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/stats failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load stats",
      },
      { status: 500 }
    );
  }
}
