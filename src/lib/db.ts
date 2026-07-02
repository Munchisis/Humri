import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Reuse connection across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | null;
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

let cached = global._mongooseConn;
let cachedPromise = global._mongoosePromise;

export async function connectDB() {
  if (cached) return cached;

  if (!cachedPromise) {
    cachedPromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:45000,
    });
  }

  try {
    cached = await cachedPromise;
  } catch (e) {
    cachedPromise = null;
    throw e;
  }

  global._mongooseConn = cached;
  global._mongoosePromise = cachedPromise;

  return cached;
}
