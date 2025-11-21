import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("dopamine-crm");
    const result = await db.collection("test").insertOne({
      createdAt: new Date(),
      source: "test-mongo-endpoint",
    });

    return res.status(200).json({
      success: true,
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Mongo error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
