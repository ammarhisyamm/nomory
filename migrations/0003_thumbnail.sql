-- Nomory: thumbnail column for scaled image delivery.
-- Small 240px variant generated client-side; list views (calendar grid,
-- memories, search, profile grid) render this instead of the 720px
-- sticker, cutting photo bandwidth on those screens by ~80-90%.
-- Apply with:  npx wrangler d1 migrations apply nomory-db --remote

ALTER TABLE meals ADD COLUMN thumbnail_image TEXT NOT NULL DEFAULT '';
