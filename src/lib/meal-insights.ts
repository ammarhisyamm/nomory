import type { Meal, MealType } from "./meals";

export const DEFAULT_DAILY_GOAL = 3;
export const MIN_DAILY_GOAL = 1;
export const MAX_DAILY_GOAL = 12;

const goalKey = (userId?: string | null) => `nomory.daily-goal.${userId ?? "guest"}`;

export function getDailyGoal(userId?: string | null) {
  if (typeof window === "undefined") return DEFAULT_DAILY_GOAL;
  try {
    const saved = Number(window.localStorage.getItem(goalKey(userId)));
    return Number.isInteger(saved) && saved >= MIN_DAILY_GOAL && saved <= MAX_DAILY_GOAL
      ? saved
      : DEFAULT_DAILY_GOAL;
  } catch {
    return DEFAULT_DAILY_GOAL;
  }
}

export function saveDailyGoal(goal: number, userId?: string | null) {
  if (!Number.isInteger(goal) || goal < MIN_DAILY_GOAL || goal > MAX_DAILY_GOAL) return false;
  try {
    window.localStorage.setItem(goalKey(userId), String(goal));
    return true;
  } catch {
    return false;
  }
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export type WeeklyInsight = {
  loggedDays: number;
  totalMeals: number;
  mostCommonType: MealType | null;
  message: string;
};

/** Builds a seven-day summary without making claims when the diary has no usable data. */
export function getWeeklyInsight(meals: Meal[], now = new Date()): WeeklyInsight {
  const lastSevenDays = new Set<string>();
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let index = 0; index < 7; index += 1) {
    lastSevenDays.add(localDateKey(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }

  const recent = meals.filter(
    (meal) => isDateKey(meal.mealDate) && lastSevenDays.has(meal.mealDate),
  );
  const loggedDays = new Set(recent.map((meal) => meal.mealDate)).size;
  const counts = new Map<MealType, number>();
  for (const meal of recent) counts.set(meal.mealType, (counts.get(meal.mealType) ?? 0) + 1);
  const mostCommonType =
    [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;

  if (recent.length === 0) {
    return {
      loggedDays: 0,
      totalMeals: 0,
      mostCommonType: null,
      message: "Log one meal to unlock your first weekly pattern.",
    };
  }
  if (loggedDays === 1) {
    return {
      loggedDays,
      totalMeals: recent.length,
      mostCommonType,
      message: "Nice start — keep logging this week to spot your routine.",
    };
  }

  const typeLabel = mostCommonType
    ? `${mostCommonType} is showing up most often`
    : "Your diary is taking shape";
  return {
    loggedDays,
    totalMeals: recent.length,
    mostCommonType,
    message: `${typeLabel} across ${loggedDays} of the last 7 days.`,
  };
}
