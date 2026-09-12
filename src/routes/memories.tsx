import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FilterPill } from "@/components/pills";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealImage,
  useMeals,
  type MealType,
} from "@/lib/meals";

export const Route = createFileRoute("/memories")({
  head: () => ({
    meta: [
      { title: "Memories — Your meal archive | Nomory" },
      {
        name: "description",
        content: "Browse every meal you've saved as a visual archive, grouped by month.",
      },
      { property: "og:title", content: "Memories — Your meal archive" },
      {
        property: "og:description",
        content: "Browse every meal you've saved as a visual archive, grouped by month.",
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
      const key = meal.mealDate.slice(0, 7);
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

        <div className="sticky top-0 z-10 -mx-5 flex gap-2 overflow-x-auto bg-background/90 px-5 py-2 backdrop-blur sm:-mx-6 sm:px-6">
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
              title={meals.length === 0 ? "Your food memories will live here" : `No ${filter} memories yet`}
              description={meals.length === 0 ? "Save a meal and it’ll appear here, ready to revisit anytime." : "Choose another meal type or show everything you’ve saved."}
              cta={meals.length === 0 ? "Add your first meal" : undefined}
              secondaryCta={meals.length > 0 ? "Show all memories" : undefined}
              onSecondary={() => setFilter("all")}
            />
          </div>
        ) : null}

        <div className="mt-6 space-y-8">
          {groups.map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-4 text-[19px] font-bold">
                {formatDateLabel(`${month}-01`, { month: "long", year: "numeric" })}
              </h2>
              <div className="columns-2 gap-4 sm:columns-3 xl:columns-4 [&>*]:mb-4">
                {items.map((meal) => (
                  <Link
                    key={meal.id}
                    to="/meal/$id"
                    params={{ id: meal.id }}
                    className="surface-card press enter-card block break-inside-avoid overflow-hidden p-0"
                  >
                    <img
                      src={mealImage(meal)}
                      alt={meal.mealName || "Saved meal"}
                      loading="lazy"
                      className="w-full object-cover"
                    />
                    <div className="p-4">
                      <p className="truncate text-[15px] font-bold">
                        {meal.mealName || MEAL_TYPES.find((t) => t.value === meal.mealType)?.label}
                      </p>
                      <p className="mt-1 text-[12.5px] text-subtle">
                        {formatDateLabel(meal.mealDate, { month: "short", day: "numeric" })} ·{" "}
                        {formatTimeLabel(meal.mealTime)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
