// Nomory cloud persistence: D1 (meal metadata) + R2 (meal photos).
// Every function here runs inside a serverFn handler (server-side only).
// This module has no server-only top-level imports so it stays safe to
// import from client components — only call these from handlers.
import type { D1Database, R2Bucket } from "./cloud-env";
import type { Meal, MealType, MenuItem } from "./meals";

export type MealRow = {
  id: string;
  user_id: string;
  meal_name: string;
  menu_items: string;
  meal_type: string;
  note: string;
  location: string;
  price: number;
  rating: number;
  meal_date: string;
  meal_time: string;
  original_image: string;
  processed_image: string;
  thumbnail_image: string;
  use_original: number;
  created_at: number;
  updated_at: number;
};

const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack", "drink"]);

export function isRemoteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.origin === "https://nomory.site" && url.pathname.startsWith("/media/");
  } catch {
    return false;
  }
}

function isDataUrl(value: string) {
  return /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value);
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1]!;
  const b64 = match[2]!;
  // Cap uploads at ~8MB decoded to protect the worker.
  if (b64.length > 11_000_000) return null;
  let bin: string;
  try {
    bin = atob(b64);
  } catch {
    return null;
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const valid = contentType.includes("png")
    ? bytes.slice(0, 8).every((b, i) => b === [137, 80, 78, 71, 13, 10, 26, 10][i])
    : contentType.includes("webp")
      ? new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
        new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
      : bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!valid) return null;
  return { bytes, contentType };
}

function extFor(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

/**
 * D1 bound-parameter ceiling is 1MB per value — inline (no-R2) storage
 * must stay under it. Client-compressed JPEGs land well below; anything
 * larger is dropped rather than risking a failed INSERT.
 */
const INLINE_MAX_CHARS = 950_000;

/**
 * Persist one photo. Returns a public R2 URL when the IMAGES binding and
 * R2_PUBLIC_URL are configured, otherwise returns the dataURL unchanged
 * so it can be stored directly in D1 (V1 fallback, fine for compressed
 * ~720–1280px JPEGs).
 */
export async function storeMealImage(
  bucket: R2Bucket | undefined,
  publicBase: string | undefined,
  userId: string,
  mealId: string,
  kind: "original" | "processed" | "thumbnail",
  value: string,
): Promise<string> {
  if (!value) return "";
  if (isRemoteUrl(value)) return value;
  if (/^https?:\/\//i.test(value)) return "";
  if (!bucket || !publicBase || !isDataUrl(value)) {
    // Inline mode: originals are redundant weight (the processed sticker
    // is what renders by default) — skip storing huge ones in D1.
    if (kind === "original" && value.length > INLINE_MAX_CHARS) return "";
    if (value.length > INLINE_MAX_CHARS) return "";
    return value;
  }
  const decoded = dataUrlToBytes(value);
  if (!decoded) return "";
  // A photo can be replaced while its meal id stays the same. Give each
  // upload a versioned object name so an immutable edge cache can never
  // serve a stale (or partially replaced) file to another device.
  const key = `meals/${userId}/${mealId}-${kind}-${crypto.randomUUID()}.${extFor(decoded.contentType)}`;
  await bucket.put(key, decoded.bytes, {
    httpMetadata: {
      contentType: decoded.contentType,
      // Keys are unique per upload and never edited in place, so
      // every object is immutable — let Cloudflare edge cache it for a
      // year. At 1000+ users this keeps photo traffic off R2 origin.
      cacheControl: "public, max-age=31536000, immutable",
    },
  });
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}

export function sanitizeMeal(input: Meal): Meal | null {
  if (!input || typeof input.id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(input.id))
    return null;
  const mealType: MealType = MEAL_TYPES.has(input.mealType) ? input.mealType : "snack";
  const menuItems: MenuItem[] = Array.isArray(input.menuItems)
    ? input.menuItems
        .filter((item) => item && typeof item.name === "string")
        .slice(0, 30)
        .map((item) => ({
          name: item.name.trim().slice(0, 120),
          price: Number.isFinite(item.price) ? Math.max(0, Math.round(item.price)) : 0,
        }))
        .filter((item) => item.name)
    : [];
  return {
    id: input.id.slice(0, 64),
    originalImage:
      typeof input.originalImage === "string" &&
      (isRemoteUrl(input.originalImage) || isDataUrl(input.originalImage))
        ? input.originalImage
        : "",
    processedImage:
      typeof input.processedImage === "string" &&
      (isRemoteUrl(input.processedImage) || isDataUrl(input.processedImage))
        ? input.processedImage
        : "",
    thumbnailImage:
      typeof input.thumbnailImage === "string" &&
      (isRemoteUrl(input.thumbnailImage) || isDataUrl(input.thumbnailImage))
        ? input.thumbnailImage
        : "",
    useOriginal: Boolean(input.useOriginal),
    mealName: String(input.mealName ?? "").slice(0, 120),
    menuItems,
    mealType,
    note: String(input.note ?? "").slice(0, 2000),
    location: String(input.location ?? "").slice(0, 160),
    price: Number.isFinite(input.price) ? Math.max(0, Math.round(input.price)) : 0,
    rating: Number.isFinite(input.rating) ? Math.min(5, Math.max(0, Math.round(input.rating))) : 0,
    mealDate: /^\d{4}-\d{2}-\d{2}$/.test(input.mealDate ?? "") ? input.mealDate : "1970-01-01",
    mealTime: /^\d{2}:\d{2}$/.test(input.mealTime ?? "") ? input.mealTime : "12:00",
    createdAt: Number.isFinite(input.createdAt) ? input.createdAt : Date.now(),
    updatedAt: Number.isFinite(input.updatedAt) ? input.updatedAt : Date.now(),
  };
}

export function rowToMeal(row: MealRow): Meal {
  let menuItems: MenuItem[] = [];
  try {
    const parsed = JSON.parse(row.menu_items || "[]");
    if (Array.isArray(parsed)) {
      menuItems = parsed
        .filter((item) => item && typeof item.name === "string")
        .map((item) => ({ name: item.name.slice(0, 120), price: Number(item.price) || 0 }))
        .slice(0, 30);
    }
  } catch {
    menuItems = [];
  }
  if (!menuItems.length && row.meal_name)
    menuItems = [{ name: row.meal_name, price: row.price || 0 }];
  return {
    id: row.id,
    originalImage: row.original_image || row.processed_image || "",
    processedImage: row.processed_image || row.original_image || "",
    thumbnailImage: row.thumbnail_image || row.processed_image || row.original_image || "",
    useOriginal: row.use_original === 1,
    mealName: row.meal_name || "",
    menuItems,
    mealType: (MEAL_TYPES.has(row.meal_type) ? row.meal_type : "snack") as MealType,
    note: row.note || "",
    location: row.location || "",
    price: row.price || 0,
    rating: row.rating || 0,
    mealDate: row.meal_date,
    mealTime: row.meal_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMeals(db: D1Database, userId: string): Promise<Meal[]> {
  const res = await db
    .prepare(
      `SELECT id, user_id, meal_name, meal_type, note, location, price, rating, meal_date, meal_time,
              original_image, processed_image, thumbnail_image, use_original, menu_items, created_at, updated_at
       FROM meals WHERE user_id = ? ORDER BY meal_date DESC, meal_time DESC LIMIT 2000`,
    )
    .bind(userId)
    .all<MealRow>();
  return (res.results ?? []).map(rowToMeal);
}

export async function getMeal(db: D1Database, userId: string, id: string): Promise<Meal | null> {
  const row = await db
    .prepare(
      `SELECT id, user_id, meal_name, meal_type, note, location, price, rating, meal_date, meal_time,
              original_image, processed_image, thumbnail_image, use_original, menu_items, created_at, updated_at
       FROM meals WHERE id = ? AND user_id = ? LIMIT 1`,
    )
    .bind(id, userId)
    .first<MealRow>();
  return row ? rowToMeal(row) : null;
}

export async function upsertMeal(db: D1Database, userId: string, meal: Meal): Promise<void> {
  await db
    .prepare(
      `INSERT INTO meals (id, user_id, meal_name, menu_items, meal_type, note, location, price, rating, meal_date,
                          meal_time, original_image, processed_image, thumbnail_image, use_original,
                          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         meal_name=excluded.meal_name, menu_items=excluded.menu_items, meal_type=excluded.meal_type, note=excluded.note,
         location=excluded.location, meal_date=excluded.meal_date, meal_time=excluded.meal_time,
         price=excluded.price, rating=excluded.rating,
         original_image=excluded.original_image, processed_image=excluded.processed_image,
         thumbnail_image=excluded.thumbnail_image,
         use_original=excluded.use_original, updated_at=excluded.updated_at
       WHERE user_id = ? AND excluded.updated_at >= meals.updated_at`,
    )
    .bind(
      meal.id,
      userId,
      meal.mealName,
      JSON.stringify(meal.menuItems ?? []),
      meal.mealType,
      meal.note,
      meal.location,
      meal.price,
      meal.rating,
      meal.mealDate,
      meal.mealTime,
      meal.originalImage,
      meal.processedImage,
      meal.thumbnailImage,
      meal.useOriginal ? 1 : 0,
      meal.createdAt,
      meal.updatedAt,
      userId,
    )
    .run();
}

export async function deleteMeal(db: D1Database, userId: string, id: string): Promise<void> {
  await db.prepare(`DELETE FROM meals WHERE id = ? AND user_id = ?`).bind(id, userId).run();
}

export async function clearMeals(db: D1Database, userId: string): Promise<void> {
  await db.prepare(`DELETE FROM meals WHERE user_id = ?`).bind(userId).run();
}
