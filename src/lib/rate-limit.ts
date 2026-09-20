import type { D1Database } from "./cloud-env";
import { getStartContext } from "@tanstack/start-storage-context";

async function hashKey(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function requestAddress() {
  const request = getStartContext({ throwIfNotFound: false })?.request;
  return (
    request?.headers.get("cf-connecting-ip") ??
    request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function enforceRateLimit(
  db: D1Database,
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
) {
  const now = Date.now();
  const resetAt = now + windowMs;
  const key = await hashKey(`${scope}:${requestAddress()}:${identity.trim().toLowerCase()}`);
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key_hash, count, reset_at, updated_at)
      VALUES (?, 1, ?, ?)
      ON CONFLICT(key_hash) DO UPDATE SET
        count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
        reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END,
        updated_at = ?
      RETURNING count, reset_at`,
    )
    .bind(key, resetAt, now, now, now, resetAt, now)
    .first<{ count: number; reset_at: number }>();
  const count = row?.count ?? 1;
  return { allowed: count <= limit, retryAfterMs: Math.max(0, (row?.reset_at ?? resetAt) - now) };
}
