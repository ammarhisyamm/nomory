import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FilterPill } from "@/components/pills";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealImage,
  toDateKey,
  useMeals,
  type MealType,
} from "@/lib/meals";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memories — Your meal archive | Nomory" },
      {
        name: "description",
        content: "Browse every meal you've saved, grouped by day.",
      },
      { property: "og:title", content: "Memories — Your meal archive" },
      {
        property: "og:description",
        content: "Browse every meal you've saved, grouped by day.",
      },
    ],
  }),
  component: MemoriesPage,
});

function MemoriesPage() {
  const { meals, ready } = useMeals();
  const [filter, setFilter] = useState<MealType | "all">("all");

  const groups = useMemo(() => {
    const filtered = filter === "all" ? meals : meals.filter((m) => m.mealType === filter);
    const map = new Map<string, typeof meals>();
    for (const meal of filtered) {
      const key = meal.mealDate;
      map.set(key, [...(map.get(key) ?? []), meal]);
    }
    return [...map.entries()];
  }, [meals, filter]);

  return (
    <AppShell>
      <Page>
        <PageHeader
          title="Memories"
          subtitle="Every meal you've saved."
          right={
            <Link
              to="/search"
              aria-label="Search meals"
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <Search className="size-[19px]" strokeWidth={1.9} />
            </Link>
          }
        />

        <div className="sticky top-0 z-10 flex w-full max-w-full gap-2 overflow-x-auto overscroll-x-contain bg-background/90 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterPill>
          {MEAL_TYPES.map((t) => (
            <FilterPill
              key={t.value}
              active={filter === t.value}
              onClick={() => setFilter(t.value)}
            >
              {t.label}
            </FilterPill>
          ))}
        </div>

        {ready && groups.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={
                meals.length === 0
                  ? "Your food memories will live here"
                  : `No ${filter} memories yet`
              }
              description={
                meals.length === 0
                  ? "Save a meal and it’ll appear here, ready to revisit anytime."
                  : "Choose another meal type or show everything you’ve saved."
              }
              cta={meals.length === 0 ? "Add your first meal" : undefined}
              secondaryCta={meals.length > 0 ? "Show all memories" : undefined}
              onSecondary={() => setFilter("all")}
            />
          </div>
        ) : null}

        <section className="mt-6 rounded-[30px] bg-card/55 p-4 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 px-1">
            <div>
              <p className="section-label">Your archive</p>
              <h2 className="mt-1 font-display text-[24px] font-extrabold">
                Days worth remembering
              </h2>
            </div>
            <Link
              to="/add"
              aria-label="Add a new memory"
              className="press inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-background px-3.5 text-[12px] font-bold text-foreground shadow-[var(--shadow-pill)] ring-1 ring-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Plus className="size-4 text-accent" strokeWidth={2.2} />
              <span className="hidden sm:inline">New memory</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>

          <div className="space-y-8">
            {groups.map(([date, items]) => (
              <DayGroup key={date} date={date} items={items} />
            ))}
          </div>
        </section>
      </Page>
    </AppShell>
  );
}

function DayGroup({ date, items }: { date: string; items: ReturnType<typeof useMeals>["meals"] }) {
  return (
    <section aria-labelledby={`day-${date}`}>
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <h3 id={`day-${date}`} className="font-display text-[21px] font-extrabold">
            {formatDateLabel(date, { weekday: "long", month: "short", day: "numeric" })}
          </h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {date === toDateKey(new Date()) ? "Today · " : ""}
            {items.length} {items.length === 1 ? "memory" : "memories"}
          </p>
        </div>
        <span className="text-[12px] font-semibold text-subtle">
          {items[0] ? formatTimeLabel(items[0].mealTime) : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((meal) => (
          <Link
            key={meal.id}
            to="/meal/$id"
            params={{ id: meal.id }}
            aria-label={`Open ${meal.mealName || "saved meal"}`}
            className="surface-card press enter-card overflow-hidden rounded-[22px] bg-card p-2"
          >
            <img
              src={mealImage(meal)}
              alt={meal.mealName || "Saved meal"}
              loading="lazy"
              className="aspect-square w-full rounded-[17px] object-cover"
            />
            <div className="px-1 pb-1 pt-2">
              <p className="truncate text-[14px] font-bold">{meal.mealName || "Saved meal"}</p>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {meal.location ||
                  formatDateLabel(meal.mealDate, { month: "short", day: "numeric" })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
