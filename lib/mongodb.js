import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.warn("MONGODB_URI is not set; MongoDB client will not be initialized.");
}

let clientPromise;

if (uri) {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
} else {
  clientPromise = Promise.reject(
    new Error("MONGODB_URI is not defined in environment.")
  );
}

export default clientPromise;
