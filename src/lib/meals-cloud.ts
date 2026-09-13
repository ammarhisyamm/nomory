// Nomory cloud sync — TanStack Start server functions backed by D1 + R2.
// Client calls these; handlers run on the server (Cloudflare Worker).
// When D1 isn't bound (local `vite dev`, preview) every function reports
// `cloud: false` and the app transparently uses on-device IndexedDB.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCloudEnv } from "./cloud-env";
import { getSessionUser } from "./auth-server";
import {
  clearMeals,
  deleteMeal,
  listMeals,
  sanitizeMeal,
  storeMealImage,
  upsertMeal,
} from "./nomory-db";
import type { Meal } from "./meals";

const mealSchema = z.object({
  id: z.string().min(1).max(64),
  originalImage: z.string().max(12_000_000).default(""),
  processedImage: z.string().max(12_000_000).default(""),
  useOriginal: z.boolean().default(false),
  mealName: z.string().max(120).default(""),
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
  .handler(async ({ data }): Promise<{ cloud: boolean; meal: Meal | null }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB || !user) return { cloud: false, meal: null };
    const clean = sanitizeMeal(data as Meal);
    if (!clean) return { cloud: false, meal: null };
    // Upload dataURL photos to R2 when configured; otherwise the values
    // pass through and are stored inline in D1.
    const [originalImage, processedImage] = await Promise.all([
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
        "processed",
        clean.processedImage,
      ),
    ]);
    const meal: Meal = { ...clean, originalImage, processedImage, updatedAt: Date.now() };
    await upsertMeal(env.DB, user.id, meal);
    return { cloud: true, meal };
  });

export const deleteMealCloud = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }): Promise<{ cloud: boolean }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB || !user) return { cloud: false };
    await deleteMeal(env.DB, user.id, data.id);
    // Best-effort R2 cleanup — old photo URLs simply stop being referenced.
    const prefix = [
      `meals/${user.id}/${data.id}-original`,
      `meals/${user.id}/${data.id}-processed`,
    ];
    if (env.IMAGES) {
      await Promise.allSettled(
        prefix.flatMap((p) =>
          [`${p}.jpg`, `${p}.png`, `${p}.webp`].map((k) => env.IMAGES!.delete(k)),
        ),
      );
    }
    return { cloud: true };
  });

export const clearMealsCloud = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ cloud: boolean }> => {
    const env = getCloudEnv();
    const user = await getSessionUser();
    if (!env.DB || !user) return { cloud: false };
    await clearMeals(env.DB, user.id);
    return { cloud: true };
  },
);
