-- Optional spending and sentiment metadata for each food memory.
ALTER TABLE meals ADD COLUMN price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE meals ADD COLUMN rating INTEGER NOT NULL DEFAULT 0;
