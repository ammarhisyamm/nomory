-- Google identities are kept separate from password accounts. A Google user
-- gets a Nomory username during first-run onboarding, while their stable
-- Google subject remains the D1/R2 diary owner id.
CREATE TABLE IF NOT EXISTS google_accounts (
  google_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_google_accounts_username
  ON google_accounts (username);
