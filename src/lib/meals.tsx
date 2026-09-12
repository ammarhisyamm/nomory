import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dbClear, dbDelete, dbGetAll, dbPut } from "./db";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  originalImage: string;
  processedImage: string;
  useOriginal: boolean;
  mealName: string;
  mealType: MealType;
  note: string;
  tags: string[];
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

export function mealImage(meal: Meal) {
  return meal.useOriginal ? meal.originalImage : meal.processedImage;
}

export function formatDateLabel(dateKey: string, opts?: Intl.DateTimeFormatOptions) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString(undefined, opts ?? { weekday: "long", month: "short", day: "numeric" });
}

export function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(h ?? 0, m ?? 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

type MealsContextValue = {
  meals: Meal[];
  ready: boolean;
  saveMeal: (meal: Meal) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getMeal: (id: string) => Meal | undefined;
  mealsByDate: (dateKey: string) => Meal[];
  streak: number;
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

  useEffect(() => {
    let alive = true;
    dbGetAll<Meal>()
      .then((rows) => {
        if (alive) setMeals(sortMeals(rows));
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const saveMeal = useCallback(async (meal: Meal) => {
    await dbPut(meal);
    setMeals((prev) => sortMeals([...prev.filter((m) => m.id !== meal.id), meal]));
  }, []);

  const removeMeal = useCallback(async (id: string) => {
    await dbDelete(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const clearAll = useCallback(async () => {
    await dbClear();
    setMeals([]);
  }, []);

  const streak = useMemo(() => {
    const days = new Set(meals.map((m) => m.mealDate));
    let count = 0;
    const cursor = new Date();
    if (!days.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(toDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [meals]);

  const value = useMemo<MealsContextValue>(
    () => ({
      meals,
      ready,
      saveMeal,
      removeMeal,
      clearAll,
      streak,
      getMeal: (id) => meals.find((m) => m.id === id),
      mealsByDate: (dateKey) =>
        meals.filter((m) => m.mealDate === dateKey).sort((a, b) => a.mealTime.localeCompare(b.mealTime)),
    }),
    [meals, ready, saveMeal, removeMeal, clearAll, streak],
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
