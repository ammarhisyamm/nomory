-- Nomory password accounts (Cloudflare D1, SQLite).
-- Apply with:  npx wrangler d1 migrations apply nomory-db --remote

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  -- Always stored lowercase; UNIQUE gives us duplicate protection.
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  -- Format: pbkdf2-sha256$<iterations>$<salt-b64>$<hash-b64>
  password_hash TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  -- Epoch ms until which login is rejected (brute-force lockout).
  locked_until INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username);
