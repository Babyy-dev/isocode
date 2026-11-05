import "server-only";
import { MongoServerError } from "mongodb";
import { getDatabase } from "./database";

export class RateLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super("Too many attempts.");
  }
}

export async function consumeFixedWindow(
  collection: string,
  userId: string,
  attempts: number,
  windowMs: number,
  now = Date.now(),
) {
  const database = await getDatabase();
  const start = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(start + windowMs);
  try {
    await database
      .collection<{ _id: string; count: number; expiresAt: Date }>(collection)
      .findOneAndUpdate(
        { _id: `${userId}:${start}`, count: { $lt: attempts } },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
        { upsert: true, returnDocument: "after" },
      );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000)
      throw new RateLimitError(
        Math.max(1, Math.ceil((+expiresAt - now) / 1000)),
      );
    throw error;
  }
}
