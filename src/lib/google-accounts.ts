import type { D1Database } from "./cloud-env";

export type GoogleAccount = {
  google_id: string;
  email: string;
  name: string;
  picture: string;
  username: string | null;
  created_at: number;
  updated_at: number;
};

export async function upsertGoogleAccount(
  db: D1Database,
  input: { googleId: string; email: string; name: string; picture: string; now: number },
): Promise<GoogleAccount> {
  await db
    .prepare(
      `INSERT INTO google_accounts (google_id, email, name, picture, username, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?)
       ON CONFLICT(google_id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture,
         updated_at = excluded.updated_at`,
    )
    .bind(input.googleId, input.email, input.name, input.picture, input.now, input.now)
    .run();
  return (await getGoogleAccount(db, input.googleId))!;
}

export async function getGoogleAccount(db: D1Database, googleId: string) {
  return await db
    .prepare(
      `SELECT google_id, email, name, picture, username, created_at, updated_at
       FROM google_accounts WHERE google_id = ?`,
    )
    .bind(googleId)
    .first<GoogleAccount>();
}

export async function getGoogleAccountByUsername(db: D1Database, username: string) {
  return await db
    .prepare(
      `SELECT google_id, email, name, picture, username, created_at, updated_at
       FROM google_accounts WHERE username = ?`,
    )
    .bind(username)
    .first<GoogleAccount>();
}

export async function setGoogleUsername(
  db: D1Database,
  input: { googleId: string; username: string; now: number },
) {
  await db
    .prepare(`UPDATE google_accounts SET username = ?, updated_at = ? WHERE google_id = ?`)
    .bind(input.username, input.now, input.googleId)
    .run();
}
