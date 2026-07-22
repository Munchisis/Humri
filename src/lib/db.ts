import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// Reuse the connection across hot-reloads in development, and across warm
// serverless invocations in production — both cases benefit from not
// re-establishing a new connection on every call.
declare global {
  // eslint-disable-next-line no-var
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cache;

export async function connectDB() {
  // readyState 1 = connected. A cached connection object can still exist
  // after a dropped connection, so check its actual state rather than just
  // its presence.
  if (cache.conn && cache.conn.connection.readyState === 1) {
    return cache.conn;
  }

  // Stale/disconnected cached connection — clear it so we reconnect below.
  if (cache.conn && cache.conn.connection.readyState !== 1) {
    cache.conn = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
      // Each warm serverless instance keeps its own pool — a high per-instance
      // limit multiplies fast under concurrent invocations. Tune this against
      // your Atlas tier's connection cap, not against expected traffic alone.
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    // Reset so the next call retries instead of re-awaiting a rejected promise
    cache.promise = null;
    throw e;
  }

  return cache.conn;
}
