import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { FoodSticker } from "@/components/food-sticker";
import { EmptyState } from "@/components/empty-state";
import { formatDateLabel, formatTimeLabel, mealImage, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search your meals | Nomory" },
      {
        name: "description",
        content: "Find a saved meal by name, note or tag in your visual food diary.",
      },
      { property: "og:title", content: "Search your meals" },
      {
        property: "og:description",
        content: "Find a saved meal by name, note or tag in your visual food diary.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { meals } = useMeals();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const results = q
    ? meals.filter((m) => [m.mealName, m.note, ...m.tags].join(" ").toLowerCase().includes(q))
    : [];

  return (
    <AppShell>
      <Page>
        <PageHeader title="Search" subtitle="Find a meal by name, note or tag." />

        <label htmlFor="meal-search" className="sr-only">
          Search meals
        </label>
        <div className="surface-card flex h-14 items-center gap-3 px-5 focus-within:border-accent">
          <SearchIcon className="size-[19px] text-subtle" strokeWidth={1.9} />
          <input
            id="meal-search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ramen, coffee, homemade…"
            className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="press rounded-full px-3 py-2 text-[13px] font-semibold text-muted-foreground"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-6 space-y-3" aria-live="polite">
          {!q ? (
            <EmptyState
              kind="search"
              compact
              title="What are you looking for?"
              description="Try a meal name, note, or tag—like ramen, coffee, or homemade."
            />
          ) : null}
          {q && results.length === 0 ? (
            <EmptyState
              kind="search"
              compact
              title={`No matches for “${query.trim()}”`}
              description="Try a shorter word, another tag, or browse all your memories."
              cta="Browse memories"
              to="/memories"
              secondaryCta="Clear search"
              onSecondary={() => setQuery("")}
            />
          ) : null}
          {q && results.length > 0 ? (
            <p className="section-label pb-1">
              {results.length} {results.length === 1 ? "memory" : "memories"} found
            </p>
          ) : null}
          {results.map((meal) => (
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
                <p className="truncate text-[16px] font-bold">{meal.mealName || "Saved meal"}</p>
                <p className="mt-1 truncate text-[13px] text-muted-foreground">
                  {formatDateLabel(meal.mealDate, { month: "short", day: "numeric" })} ·{" "}
                  {formatTimeLabel(meal.mealTime)}
                  {meal.note ? ` · ${meal.note}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Page>
    </AppShell>
  );
}
