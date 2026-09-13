import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import { cn } from "@/lib/utils";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealThumb,
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
  const shift = (delta: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
    setCursor(next);
    setSelected(toDateKey(next));
  };
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(toDateKey(today));
  };

  return (
    <AppShell>
      <Page>
        <PageHeader title="Calendar" subtitle="Your meals, day by day." />

        <div className="surface-card min-w-0 max-w-full rounded-[28px] p-4 sm:p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="font-display text-[22px] font-extrabold capitalize">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="press hidden h-11 rounded-full bg-muted px-4 text-[13px] font-semibold text-muted-foreground sm:block"
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shift(-1)}
                className="press grid size-10 place-items-center rounded-full bg-background shadow-[var(--shadow-pill)]"
              >
                <ChevronLeft className="size-[18px]" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shift(1)}
                className="press grid size-10 place-items-center rounded-full bg-background shadow-[var(--shadow-pill)]"
              >
                <ChevronRight className="size-[18px]" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 text-center text-[11px] font-bold text-muted-foreground sm:text-[12px]">
            {WEEKDAYS.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2">
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
                    "press relative flex min-w-0 aspect-auto min-h-[70px] flex-col items-center justify-start gap-1 rounded-[15px] p-1 text-[10px] font-bold transition-colors sm:min-h-[94px] sm:gap-1.5 sm:rounded-[18px] sm:p-1.5 sm:text-[12px]",
                    isSelected
                      ? "bg-accent-soft text-accent shadow-[var(--shadow-pill)]"
                      : "hover:bg-muted",
                  )}
                >
                  <span>{Number(key.slice(-2))}</span>
                  {first ? (
                    <span className="relative">
                      <img
                        src={mealThumb(first)}
                        alt=""
                        loading="lazy"
                        className="size-9 rounded-[10px] object-cover shadow-[var(--shadow-pill)] sm:size-12 sm:rounded-[13px]"
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

          <Link
            to="/add"
            className="press mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-[15px] font-bold text-accent-foreground shadow-[var(--shadow-pill)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-5" strokeWidth={2.2} />
            Add a meal
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-[22px] font-bold">{formatDateLabel(selected)}</h2>
          {dayMeals.length === 0 ? (
            <EmptyState
              compact
              title="Nothing saved on this day"
              description="Add a meal for this date, or pick another day with a photo in the calendar."
              cta="Add a meal"
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
                    src={mealThumb(meal)}
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
