// Nomory cloud persistence: D1 (meal metadata) + R2 (meal photos).
// Every function here runs inside a serverFn handler (server-side only).
// This module has no server-only top-level imports so it stays safe to
// import from client components — only call these from handlers.
import type { D1Database, R2Bucket } from "./cloud-env";
import type { Meal, MealType } from "./meals";

export type MealRow = {
  id: string;
  user_id: string;
  meal_name: string;
  meal_type: string;
  note: string;
  location: string;
  meal_date: string;
  meal_time: string;
  original_image: string;
  processed_image: string;
  use_original: number;
  created_at: number;
  updated_at: number;
};

const MEAL_TYPES = new Set(["breakfast", "lunch", "dinner", "snack", "drink"]);

export function isRemoteUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function isDataUrl(value: string) {
  return value.startsWith("data:image/");
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1]!;
  const b64 = match[2]!;
  // Cap uploads at ~8MB decoded to protect the worker.
  if (b64.length > 11_000_000) return null;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, contentType };
}

function extFor(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

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
  kind: "original" | "processed",
  value: string,
): Promise<string> {
  if (!value || isRemoteUrl(value)) return value;
  if (!bucket || !publicBase || !isDataUrl(value)) return value;
  const decoded = dataUrlToBytes(value);
  if (!decoded) return value;
  const key = `meals/${userId}/${mealId}-${kind}.${extFor(decoded.contentType)}`;
  await bucket.put(key, decoded.bytes, {
    httpMetadata: { contentType: decoded.contentType },
  });
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}

export function sanitizeMeal(input: Meal): Meal | null {
  if (!input || typeof input.id !== "string" || !input.id) return null;
  const mealType: MealType = MEAL_TYPES.has(input.mealType) ? input.mealType : "snack";
  return {
    id: input.id.slice(0, 64),
    originalImage: typeof input.originalImage === "string" ? input.originalImage : "",
    processedImage: typeof input.processedImage === "string" ? input.processedImage : "",
    useOriginal: Boolean(input.useOriginal),
    mealName: String(input.mealName ?? "").slice(0, 120),
    mealType,
    note: String(input.note ?? "").slice(0, 2000),
    location: String(input.location ?? "").slice(0, 160),
    mealDate: /^\d{4}-\d{2}-\d{2}$/.test(input.mealDate ?? "") ? input.mealDate : "1970-01-01",
    mealTime: /^\d{2}:\d{2}$/.test(input.mealTime ?? "") ? input.mealTime : "12:00",
    createdAt: Number.isFinite(input.createdAt) ? input.createdAt : Date.now(),
    updatedAt: Number.isFinite(input.updatedAt) ? input.updatedAt : Date.now(),
  };
}

export function rowToMeal(row: MealRow): Meal {
  return {
    id: row.id,
    originalImage: row.original_image || "",
    processedImage: row.processed_image || row.original_image || "",
    useOriginal: row.use_original === 1,
    mealName: row.meal_name || "",
    mealType: (MEAL_TYPES.has(row.meal_type) ? row.meal_type : "snack") as MealType,
    note: row.note || "",
    location: row.location || "",
    mealDate: row.meal_date,
    mealTime: row.meal_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMeals(db: D1Database, userId: string): Promise<Meal[]> {
  const res = await db
    .prepare(
      `SELECT id, user_id, meal_name, meal_type, note, location, meal_date, meal_time,
              original_image, processed_image, use_original, created_at, updated_at
       FROM meals WHERE user_id = ? ORDER BY meal_date DESC, meal_time DESC LIMIT 2000`,
    )
    .bind(userId)
    .all<MealRow>();
  return (res.results ?? []).map(rowToMeal);
}

export async function upsertMeal(db: D1Database, userId: string, meal: Meal): Promise<void> {
  await db
    .prepare(
      `INSERT INTO meals (id, user_id, meal_name, meal_type, note, location, meal_date,
                          meal_time, original_image, processed_image, use_original,
                          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         meal_name=excluded.meal_name, meal_type=excluded.meal_type, note=excluded.note,
         location=excluded.location, meal_date=excluded.meal_date, meal_time=excluded.meal_time,
         original_image=excluded.original_image, processed_image=excluded.processed_image,
         use_original=excluded.use_original, updated_at=excluded.updated_at
       WHERE user_id = ?`,
    )
    .bind(
      meal.id,
      userId,
      meal.mealName,
      meal.mealType,
      meal.note,
      meal.location,
      meal.mealDate,
      meal.mealTime,
      meal.originalImage,
      meal.processedImage,
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
