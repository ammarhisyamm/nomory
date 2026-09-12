-- Replace the user-facing meal tags with an optional location.
-- The legacy tags column is kept for backward-compatible database rows;
-- application code no longer writes or displays it.
ALTER TABLE meals ADD COLUMN location TEXT NOT NULL DEFAULT '';
