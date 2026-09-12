import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import { cn } from "@/lib/utils";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealImage,
  toDateKey,
  useMeals,
} from "@/lib/meals";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Your meals by day | Nomory" },
      {
        name: "description",
        content: "See your meal photos laid out across the month and revisit any day.",
      },
      { property: "og:title", content: "Calendar — Your meals by day" },
      {
        property: "og:description",
        content: "See your meal photos laid out across the month and revisit any day.",
      },
    ],
  }),
  component: CalendarPage,
});

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function CalendarPage() {
  const { meals, mealsByDate } = useMeals();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(toDateKey(today));

  const cells = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = firstDay.getDay();
    const list: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) {
      list.push(toDateKey(new Date(cursor.getFullYear(), cursor.getMonth(), d)));
    }
    return list;
  }, [cursor]);

  const byDate = useMemo(() => {
    const map = new Map<string, typeof meals>();
    for (const meal of meals) map.set(meal.mealDate, [...(map.get(meal.mealDate) ?? []), meal]);
    return map;
  }, [meals]);

  const dayMeals = mealsByDate(selected);
  const shift = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <AppShell>
      <Page>
        <PageHeader title="Calendar" subtitle="Your meals, day by day." />

        <div className="surface-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[19px] font-bold">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shift(-1)}
                className="press grid size-11 place-items-center rounded-full bg-muted"
              >
                <ChevronLeft className="size-[18px]" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shift(1)}
                className="press grid size-11 place-items-center rounded-full bg-muted"
              >
                <ChevronRight className="size-[18px]" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-[12px] font-semibold text-subtle">
            {WEEKDAYS.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((key, i) => {
              if (!key) return <span key={`empty-${i}`} />;
              const items = byDate.get(key) ?? [];
              const isSelected = key === selected;
              const first = items[0];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cn(
                    "press relative flex aspect-square flex-col items-center justify-start gap-1 rounded-[16px] p-1.5 text-[12px] font-semibold transition-colors",
                    isSelected ? "bg-accent-soft text-accent" : "hover:bg-muted",
                  )}
                >
                  <span>{Number(key.slice(-2))}</span>
                  {first ? (
                    <span className="relative">
                      <img
                        src={mealImage(first)}
                        alt=""
                        loading="lazy"
                        className="size-7 rounded-[9px] object-cover shadow-[var(--shadow-pill)]"
                      />
                      {items.length > 1 ? (
                        <span className="absolute -right-1.5 -bottom-1 grid size-4 place-items-center rounded-full bg-accent text-[9px] text-accent-foreground">
                          {items.length}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-[22px] font-bold">{formatDateLabel(selected)}</h2>
          {dayMeals.length === 0 ? (
            <EmptyState
              title="No meals here yet"
              description="Meals you save will appear on this date."
              cta="Add Meal"
            />
          ) : (
            <div className="space-y-3">
              {dayMeals.map((meal) => (
                <Link
                  key={meal.id}
                  to="/meal/$id"
                  params={{ id: meal.id }}
                  className="surface-card press enter-card flex items-center gap-4 p-4"
                >
                  <FoodSticker
                    src={mealImage(meal)}
                    alt={meal.mealName || "Saved meal"}
                    className="size-16"
                    rounded="rounded-[18px]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-accent">
                      {MEAL_TYPES.find((t) => t.value === meal.mealType)?.label}
                    </p>
                    <p className="truncate text-[16px] font-bold">
                      {meal.mealName || "Saved meal"}
                    </p>
                  </div>
                  <span className="text-[13px] font-medium text-subtle">
                    {formatTimeLabel(meal.mealTime)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </Page>
    </AppShell>
  );
}
