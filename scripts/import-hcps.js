/* eslint-disable @typescript-eslint/no-var-requires */
const xlsx = require("xlsx");

async function getClientPromise() {
  // نحاول أولاً require، ولو فشل بسبب ESM نستخدم dynamic import
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    const mod = require("../lib/mongodb");
    return mod.default || mod;
  } catch (err) {
    if (err && err.code === "ERR_REQUIRE_ESM") {
      const mod = await import("../lib/mongodb.js");
      return mod.default || mod;
    }
    throw err;
  }
}

function mapRow(row) {
  const name = (row["Name"] || "").toString().trim();
  if (!name) return null;

  const clientTag = (row["Client Tag"] || "").toString().toLowerCase();
  const speciality = (row["Speciality"] || "").toString().trim();
  const area = (row["Area Tag"] || "").toString().trim();
  const phone = row["Phone"] ? row["Phone"].toString().trim() : null;
  const repName = (row["Representative Name"] || "").toString().trim();
  const comment = (row["Comment"] || "").toString().trim();

  let type = /** @type {"pharmacy" | "doctor" | "hospital" | "other"} */ (
    "other"
  );

  const specialityLower = speciality.toLowerCase();

  if (
    clientTag === "pharmacy" ||
    specialityLower === "pharmacy"
  ) {
    type = "pharmacy";
  } else if (clientTag === "hospital") {
    type = "hospital";
  } else if (
    clientTag.includes("dr") ||
    specialityLower.length > 0
  ) {
    type = "doctor";
  } else {
    type = "other";
  }

  const lat = Number(row["Latitude"]);
  const lng = Number(row["Longitude"]);
  let location;
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    location = { lat, lng };
  }

  let createdAt;
  if (row["Created At"]) {
    const d = new Date(row["Created At"]);
    createdAt = Number.isNaN(d.getTime()) ? new Date() : d;
  } else {
    createdAt = new Date();
  }

  return {
    name,
    type,
    specialty: speciality || null,
    region: area || null,
    location,
    phone: phone || null,
    repName: repName || null,
    comment: comment || null,
    createdAt,
    updatedAt: new Date(),
  };
}

async function main() {
  const workbook = xlsx.readFile("hcps.xlsx");
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const clientPromise = await getClientPromise();
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("customers");

  await collection.createIndex({ name: 1, region: 1 }, { unique: false });

  let totalRows = 0;
  let processed = 0;
  let skipped = 0;

  for (const row of rows) {
    totalRows += 1;
    const doc = mapRow(row);
    if (!doc) {
      skipped += 1;
      continue;
    }

    await collection.updateOne(
      { name: doc.name, region: doc.region || null },
      {
        $set: {
          type: doc.type,
          specialty: doc.specialty,
          region: doc.region,
          location: doc.location,
          phone: doc.phone,
          repName: doc.repName,
          comment: doc.comment,
          updatedAt: doc.updatedAt,
        },
        $setOnInsert: {
          createdAt: doc.createdAt,
        },
      },
      { upsert: true }
    );
    processed += 1;
  }

  console.log(`Total rows in Excel: ${totalRows}`);
  console.log(`Inserted/updated documents: ${processed}`);
  console.log(`Skipped rows (no name): ${skipped}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("import-hcps failed:", err && err.message ? err.message : err);
    process.exit(1);
  });

