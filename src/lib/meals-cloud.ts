// Nomory cloud sync — TanStack Start server functions backed by D1 + R2.
// Client calls these; handlers run on the server (Cloudflare Worker).
// When D1 isn't bound (local `vite dev`, preview) every function reports
// `cloud: false` and the app transparently uses on-device IndexedDB.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCloudEnv } from "./cloud-env";
import { getSessionUser } from "./auth-server";
import { enforceRateLimit } from "./rate-limit";
import {
  clearMeals,
  deleteMeal,
  getMeal,
  listMeals,
  sanitizeMeal,
  storeMealImage,
  upsertMeal,
} from "./nomory-db";
import type { Meal } from "./meals";

async function removeObjectsByPrefix(
  bucket: NonNullable<ReturnType<typeof getCloudEnv>["IMAGES"]>,
  prefix: string,
  keep = new Set<string>(),
) {
  let cursor: string | undefined;
  do {
    const listed = await bucket.list({ prefix, limit: 1000, ...(cursor ? { cursor } : {}) });
    const keys = listed.objects.map((item) => item.key).filter((key) => !keep.has(key));
    if (keys.length) await bucket.delete(keys);
    cursor = listed.truncated ? listed.cursor : undefined;
  } while (cursor);
}

const mealSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
  originalImage: z.string().max(4_000_000).default(""),
  processedImage: z.string().max(4_000_000).default(""),
  thumbnailImage: z.string().max(1_500_000).default(""),
  useOriginal: z.boolean().default(false),
  mealName: z.string().max(120).default(""),
  menuItems: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        price: z.number().int().min(0).max(100_000_000),
      }),
    )
    .max(30)
    .default([]),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "drink"]).default("snack"),
  note: z.string().max(2000).default(""),
  location: z.string().max(160).default(""),
  price: z.number().int().min(0).max(100_000_000).default(0),
  rating: z.number().int().min(0).max(5).default(0),
  mealDate: z.string().default("1970-01-01"),
  mealTime: z.string().default("12:00"),
  createdAt: z.number().default(() => Date.now()),
  updatedAt: z.number().default(() => Date.now()),
});

export type CloudStatus = {
  cloud: boolean;
  signedIn: boolean;
  storage: "r2" | "d1-inline";
};

export const getCloudStatus = createServerFn().handler(async (): Promise<CloudStatus> => {
  const env = getCloudEnv();
  const user = await getSessionUser();
  return {
    cloud: Boolean(env.DB && user),
    signedIn: Boolean(user),
    storage: env.IMAGES && env.R2_PUBLIC_URL ? "r2" : "d1-inline",
  };
});

export const listMealsCloud = createServerFn().handler(
  async (): Promise<{ cloud: boolean; meals: Meal[] }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB || !user) return { cloud: false, meals: [] };
    return { cloud: true, meals: await listMeals(env.DB, user.id) };
  },
);

export const saveMealCloud = createServerFn({ method: "POST" })
  .validator(mealSchema)
  .handler(async ({ data }): Promise<{ cloud: boolean; meal: Meal | null; error?: string }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB) return { cloud: false, meal: null, error: "Cloud sync is unavailable." };
    if (!user) return { cloud: false, meal: null, error: "Your session expired. Sign in again." };
    if (!(await enforceRateLimit(env.DB, "meal-write", user.id, 60, 10 * 60_000)).allowed)
      return { cloud: false, meal: null, error: "Too many saves. Try again in a few minutes." };
    const clean = sanitizeMeal(data as Meal);
    if (!clean) return { cloud: false, meal: null, error: "Some meal details need checking." };

    try {
      // The processed image is required for a useful meal card. Original and
      // thumbnail uploads are best-effort so one optional R2 failure cannot
      // discard the meal itself.
      const processedImage = await storeMealImage(
        env.IMAGES,
        env.R2_PUBLIC_URL,
        user.id,
        clean.id,
        "processed",
        clean.processedImage,
      );
      const [originalResult, thumbnailResult] = await Promise.allSettled([
        storeMealImage(
          env.IMAGES,
          env.R2_PUBLIC_URL,
          user.id,
          clean.id,
          "original",
          clean.originalImage,
        ),
        storeMealImage(
          env.IMAGES,
          env.R2_PUBLIC_URL,
          user.id,
          clean.id,
          "thumbnail",
          clean.thumbnailImage || clean.processedImage,
        ),
      ]);
      const originalImage = originalResult.status === "fulfilled" ? originalResult.value : "";
      const thumbnailImage =
        thumbnailResult.status === "fulfilled" ? thumbnailResult.value : processedImage;
      const meal: Meal = {
        ...clean,
        originalImage,
        processedImage,
        thumbnailImage,
        useOriginal: clean.useOriginal && Boolean(originalImage),
        // Keep the client's edit timestamp for conflict ordering. Giving an
        // older, slower upload a newer server timestamp can overwrite the
        // photo that was actually selected last on another device.
        updatedAt: clean.updatedAt,
      };
      await upsertMeal(env.DB, user.id, meal);
      return { cloud: true, meal: await getMeal(env.DB, user.id, meal.id) };
    } catch (error) {
      console.error("meal_save_failed", error instanceof Error ? error.message : String(error));
      return {
        cloud: false,
        meal: null,
        error: "We couldn’t save this meal right now. Check your connection and try again.",
      };
    }
  });

export const deleteMealCloud = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/) }))
  .handler(async ({ data }): Promise<{ cloud: boolean }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB || !user) return { cloud: false };
    if (!(await enforceRateLimit(env.DB, "meal-delete", user.id, 60, 10 * 60_000)).allowed)
      return { cloud: false };
    await deleteMeal(env.DB, user.id, data.id);
    if (env.IMAGES) {
      await removeObjectsByPrefix(env.IMAGES, `meals/${user.id}/${data.id}-`);
    }
    return { cloud: true };
  });

export const clearMealsCloud = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ cloud: boolean }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB || !user) return { cloud: false };
    if (!(await enforceRateLimit(env.DB, "meal-clear", user.id, 10, 10 * 60_000)).allowed)
      return { cloud: false };
    await clearMeals(env.DB, user.id);
    if (env.IMAGES) await removeObjectsByPrefix(env.IMAGES, `meals/${user.id}/`);
    return { cloud: true };
  },
);
