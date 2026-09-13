import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { dbClear, dbDelete, dbGetAll, dbPut } from "./db";
import { getAuthStatus } from "./auth";
import { clearMealsCloud, deleteMealCloud, listMealsCloud, saveMealCloud } from "./meals-cloud";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "drink";

export type Meal = {
  id: string;
  originalImage: string;
  processedImage: string;
  /** 240px variant for list views; empty on meals saved before it existed. */
  thumbnailImage: string;
  useOriginal: boolean;
  mealName: string;
  mealType: MealType;
  note: string;
  location: string;
  price: number;
  rating: number;
  /** yyyy-mm-dd */
  mealDate: string;
  /** HH:mm */
  mealTime: string;
  createdAt: number;
  updatedAt: number;
};

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "drink", label: "Drink" },
];

export function suggestMealType(time: string): MealType {
  const hour = Number(time.slice(0, 2));
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "snack";
}

export function toDateKey(d: Date) {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function toTimeKey(d: Date) {
  return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
}

function rewriteLegacyHost(value: string) {
  const legacyHost = "https://pub-9ac9781ada9641ffb736141d7132a2eb.r2.dev/";
  return value.startsWith(legacyHost)
    ? `https://nomory.site/media/${value.slice(legacyHost.length)}`
    : value;
}

export function mealImage(meal: Meal) {
  return rewriteLegacyHost(meal.useOriginal ? meal.originalImage : meal.processedImage);
}

/** Small 240px variant for grids/lists — falls back gracefully for old meals. */
export function mealThumb(meal: Meal) {
  return rewriteLegacyHost(meal.thumbnailImage || meal.processedImage || meal.originalImage);
}

export function formatDateLabel(dateKey: string, opts?: Intl.DateTimeFormatOptions) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(
    undefined,
    opts ?? { weekday: "long", month: "short", day: "numeric" },
  );
}

export function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function calculateStreak(meals: Pick<Meal, "mealDate">[], now = new Date()) {
  const days = new Set(meals.map((meal) => meal.mealDate));
  let count = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!days.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(toDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

type MealsContextValue = {
  meals: Meal[];
  ready: boolean;
  /** True when signed in + D1 bound: writes also go to the cloud. */
  cloudEnabled: boolean;
  syncing: boolean;
  saveMeal: (meal: Meal) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getMeal: (id: string) => Meal | undefined;
  mealsByDate: (dateKey: string) => Meal[];
  streak: number;
  /** Pull latest from cloud and merge (cloud wins on conflict). */
  syncNow: () => Promise<void>;
};

const MealsContext = createContext<MealsContextValue | null>(null);

const sortMeals = (list: Meal[]) =>
  [...list].sort((a, b) =>
    a.mealDate === b.mealDate
      ? b.mealTime.localeCompare(a.mealTime)
      : b.mealDate.localeCompare(a.mealDate),
  );

export function MealsProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [ready, setReady] = useState(false);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const cloudRef = useRef(false);
  const migratedRef = useRef<Set<string>>(new Set());
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const userId = auth?.user?.id ?? null;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = userId;

  // Load the on-device cache for the current account. The cache is
  // namespaced per user id so accounts never see each other's offline
  // meals on a shared device.
  useEffect(() => {
    let alive = true;
    setReady(false);
    setMeals([]);
    cloudRef.current = false;
    setCloudEnabled(false);
    const ns = userId ?? undefined;
    (async () => {
      try {
        let rows = await dbGetAll<Meal>(ns);
        // One-time adoption: meals saved before first login live in the
        // legacy shared store — move them into this account and push them
        // to the cloud in the background.
        if (userId && rows.length === 0 && !migratedRef.current.has(userId)) {
          migratedRef.current.add(userId);
          const legacy = await dbGetAll<Meal>(undefined).catch(() => [] as Meal[]);
          if (legacy.length > 0) {
            await Promise.allSettled(legacy.map((m) => dbPut(m, userId)));
            rows = legacy;
            void Promise.allSettled(
              legacy.map((m) => saveMealCloud({ data: m }).catch(() => undefined)),
            );
            void dbClear(undefined).catch(() => undefined);
          }
        }
        if (alive) setMeals(sortMeals(rows));
      } catch {
        // Empty cache — cloud sync below still runs when signed in.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  const mergeCloudMeals = useCallback(
    async (cloudMeals: Meal[]) => {
      let merged: Meal[] = [];
      setMeals((prev) => {
        const byId = new Map(prev.map((m) => [m.id, m]));
        for (const cm of cloudMeals) {
          const local = byId.get(cm.id);
          if (!local || cm.updatedAt >= local.updatedAt) byId.set(cm.id, cm);
        }
        merged = sortMeals([...byId.values()]);
        return merged;
      });
      // Refresh the on-device cache so offline mode shows cloud meals too.
      const ns = userId ?? undefined;
      await Promise.allSettled(merged.map((m) => dbPut(m, ns)));
    },
    [userId],
  );

  const syncNow = useCallback(async () => {
    if (!userId) return;
    setSyncing(true);
    try {
      const res = await listMealsCloud();
      if (res.cloud) {
        cloudRef.current = true;
        setCloudEnabled(true);
        // Reconcile local-first saves too. This matters when a meal was
        // captured while cloud sync was unavailable: the desktop could keep
        // showing it from IndexedDB while another device only saw D1.
        const localRows = await dbGetAll<Meal>(userId).catch(() => [] as Meal[]);
        const cloudIds = new Set(res.meals.map((meal) => meal.id));
        const localOnly = localRows.filter((meal) => !cloudIds.has(meal.id));
        const uploaded = await Promise.all(
          localOnly.map(async (meal) => {
            try {
              const saved = await saveMealCloud({ data: meal });
              return saved.cloud && saved.meal ? saved.meal : null;
            } catch {
              return null;
            }
          }),
        );
        await mergeCloudMeals([
          ...res.meals,
          ...uploaded.filter((meal): meal is Meal => Boolean(meal)),
        ]);
      } else {
        cloudRef.current = false;
        setCloudEnabled(false);
      }
    } catch {
      // Offline or cloud unavailable — local IndexedDB stays the source.
    } finally {
      setSyncing(false);
    }
  }, [userId, mergeCloudMeals]);

  useEffect(() => {
    if (!userId) {
      cloudRef.current = false;
      setCloudEnabled(false);
      return;
    }
    void syncNow();
  }, [userId, syncNow]);

  const saveMeal = useCallback(
    async (meal: Meal) => {
      const ns = userId ?? undefined;
      await dbPut(meal, ns);
      setMeals((prev) => sortMeals([...prev.filter((m) => m.id !== meal.id), meal]));
      // Cloud write-through (fire-and-forget): server uploads photos to R2
      // when configured and returns the meal with remote URLs.
      if (cloudRef.current || userId) {
        saveMealCloud({ data: meal })
          .then(async (res) => {
            if (!res.cloud) {
              if (userId) {
                cloudRef.current = false;
                setCloudEnabled(false);
              }
              return;
            }
            cloudRef.current = true;
            setCloudEnabled(true);
            if (res.meal) {
              await dbPut(res.meal, ns);
              setMeals((prev) => sortMeals([...prev.filter((m) => m.id !== meal.id), res.meal!]));
            }
          })
          .catch(() => undefined);
      }
    },
    [userId],
  );

  const removeMeal = useCallback(
    async (id: string) => {
      await dbDelete(id, userId ?? undefined);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      if (cloudRef.current) {
        deleteMealCloud({ data: { id } }).catch(() => undefined);
      }
    },
    [userId],
  );

  const clearAll = useCallback(async () => {
    await dbClear(userIdRef.current ?? undefined);
    setMeals([]);
    if (cloudRef.current) {
      clearMealsCloud().catch(() => undefined);
    }
  }, []);

  const streak = useMemo(() => calculateStreak(meals), [meals]);

  const value = useMemo<MealsContextValue>(
    () => ({
      meals,
      ready,
      cloudEnabled,
      syncing,
      saveMeal,
      removeMeal,
      clearAll,
      streak,
      syncNow,
      getMeal: (id) => meals.find((m) => m.id === id),
      mealsByDate: (dateKey) =>
        meals
          .filter((m) => m.mealDate === dateKey)
          .sort((a, b) => a.mealTime.localeCompare(b.mealTime)),
    }),
    [meals, ready, cloudEnabled, syncing, saveMeal, removeMeal, clearAll, streak, syncNow],
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error("useMeals must be used inside MealsProvider");
  return ctx;
}

/** Draft passed from the capture step to the preview step. */
export type MealDraft = {
  original: string;
  processed: string;
  thumbnail: string;
};

let draft: MealDraft | null = null;
export const mealDraft = {
  set(value: MealDraft | null) {
    draft = value;
  },
  get() {
    return draft;
  },
};
