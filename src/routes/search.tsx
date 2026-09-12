import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { FoodSticker } from "@/components/food-sticker";
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

        <div className="surface-card flex h-14 items-center gap-3 px-5">
          <SearchIcon className="size-[19px] text-subtle" strokeWidth={1.9} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ramen, coffee, homemade…"
            className="h-full w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
          />
        </div>

        <div className="mt-6 space-y-3">
          {q && results.length === 0 ? (
            <p className="text-[14.5px] text-muted-foreground">Nothing matches “{query}” yet.</p>
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
