
// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function dbConnect() {
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(MONGODB_URI!, {
      dbName: 'dopamine_crm',
    });
  }
  return global._mongooseConn;
}
