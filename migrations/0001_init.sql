-- Nomory database schema (Cloudflare D1, SQLite).
-- Apply with:  npx wrangler d1 migrations apply nomory-db --remote
-- Local preview: npx wrangler d1 migrations apply nomory-db --local

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meal_name TEXT NOT NULL DEFAULT '',
  meal_type TEXT NOT NULL DEFAULT 'snack',
  note TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  meal_date TEXT NOT NULL,
  meal_time TEXT NOT NULL,
  -- Either a public R2 URL (https://…) or a dataURL fallback when R2
  -- isn't configured. Client renders both transparently.
  original_image TEXT NOT NULL DEFAULT '',
  processed_image TEXT NOT NULL DEFAULT '',
  use_original INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_meals_user_date
  ON meals (user_id, meal_date DESC, meal_time DESC);

CREATE INDEX IF NOT EXISTS idx_meals_user_updated
  ON meals (user_id, updated_at DESC);
