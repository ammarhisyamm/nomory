// Username-account storage helpers (D1). Kept free of serverFn imports
// so the logic stays unit-testable with a fake D1 binding.
import { z } from "zod";
import type { D1Database } from "./cloud-env";

/** After this many wrong passwords the account locks for LOCKOUT_MS. */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username minimal 3 karakter.")
  .max(20, "Username maksimal 20 karakter.")
  .regex(/^[a-z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore.");

export const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(128, "Password maksimal 128 karakter.");

export const displayNameSchema = z
  .string()
  .trim()
  .max(40, "Nama maksimal 40 karakter.")
  .default("");

export type UserRow = {
  id: string;
  username: string;
  name: string;
  password_hash: string;
  failed_attempts: number;
  locked_until: number;
  created_at: number;
  updated_at: number;
};

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isLocked(user: UserRow, now: number): boolean {
  return user.locked_until > now;
}

export async function findUserByUsername(
  db: D1Database,
  username: string,
): Promise<UserRow | null> {
  const row = await db
    .prepare(
      `SELECT id, username, name, password_hash, failed_attempts, locked_until,
              created_at, updated_at FROM users WHERE username = ?`,
    )
    .bind(username)
    .first<UserRow>();
  return row ?? null;
}

export async function findUserById(db: D1Database, id: string): Promise<UserRow | null> {
  const row = await db
    .prepare(
      `SELECT id, username, name, password_hash, failed_attempts, locked_until,
              created_at, updated_at FROM users WHERE id = ?`,
    )
    .bind(id)
    .first<UserRow>();
  return row ?? null;
}

export async function countUsers(db: D1Database): Promise<number> {
  const row = await db.prepare(`SELECT COUNT(*) AS c FROM users`).first<{ c: number }>();
  return typeof row?.c === "number" ? row.c : 0;
}

export async function updatePasswordHash(
  db: D1Database,
  id: string,
  passwordHash: string,
  now: number,
): Promise<void> {
  await db
    .prepare(`UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`)
    .bind(passwordHash, now, id)
    .run();
}

export async function createUser(
  db: D1Database,
  input: { id: string; username: string; name: string; passwordHash: string; now: number },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (id, username, name, password_hash, failed_attempts,
                          locked_until, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 0, ?, ?)`,
    )
    .bind(input.id, input.username, input.name, input.passwordHash, input.now, input.now)
    .run();
}

export async function recordFailedLogin(
  db: D1Database,
  user: UserRow,
  now: number,
): Promise<{ locked: boolean }> {
  const attempts = user.failed_attempts + 1;
  if (attempts >= MAX_FAILED_ATTEMPTS) {
    await db
      .prepare(
        `UPDATE users SET failed_attempts = 0, locked_until = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(now + LOCKOUT_MS, now, user.id)
      .run();
    return { locked: true };
  }
  await db
    .prepare(`UPDATE users SET failed_attempts = ?, updated_at = ? WHERE id = ?`)
    .bind(attempts, now, user.id)
    .run();
  return { locked: false };
}

export async function resetLoginAttempts(db: D1Database, id: string): Promise<void> {
  await db
    .prepare(`UPDATE users SET failed_attempts = 0, locked_until = 0 WHERE id = ?`)
    .bind(id)
    .run();
}
