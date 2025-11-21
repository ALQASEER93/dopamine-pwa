import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid visit id",
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("dopamine-crm");
    const visits = db.collection("visits");
    const _id = new ObjectId(id);

    if (req.method === "GET") {
      const doc = await visits.findOne({ _id });
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: "Visit not found",
        });
      }
      return res.status(200).json({ success: true, data: doc });
    }

    if (req.method === "PUT") {
      const {
        repId,
        customerId,
        visitType,
        notes,
        status,
        visitDate,
        location,
      } = req.body || {};

      const update = { $set: { updatedAt: new Date() } };

      if (repId !== undefined) update.$set.repId = repId;
      if (customerId !== undefined) update.$set.customerId = customerId;
      if (visitType !== undefined) update.$set.visitType = visitType;
      if (notes !== undefined) update.$set.notes = notes;
      if (status !== undefined) update.$set.status = status;
      if (visitDate !== undefined) {
        update.$set.visitDate = visitDate ? new Date(visitDate) : null;
      }
      if (location !== undefined) {
        update.$set.location =
          location && location.lat && location.lng
            ? {
                lat: Number(location.lat),
                lng: Number(location.lng),
              }
            : null;
      }

      const result = await visits.updateOne({ _id }, update);

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Visit not found",
        });
      }

      return res.status(200).json({
        success: true,
        modifiedCount: result.modifiedCount,
      });
    }

    if (req.method === "DELETE") {
      const result = await visits.deleteOne({ _id });
      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Visit not found",
        });
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  } catch (error) {
    console.error("API /api/visits/[id] error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
