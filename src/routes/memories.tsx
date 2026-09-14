import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, ChevronRight, Search, UtensilsCrossed, Wallet } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import { formatDateLabel, mealThumb, toDateKey, useMeals } from "@/lib/meals";

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

  const groups = useMemo(() => {
    const map = new Map<string, typeof meals>();
    for (const meal of meals) {
      const key = meal.mealDate;
      map.set(key, [...(map.get(key) ?? []), meal]);
    }
    return [...map.entries()];
  }, [meals]);
  const totalSpend = meals.reduce((sum, meal) => sum + (meal.price || 0), 0);
  const loggedDays = new Set(meals.map((meal) => meal.mealDate)).size;

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

        {ready && groups.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              kind="memories"
              title={
                meals.length === 0
                  ? "Your food memories will live here"
                  : "Your saved memories will appear here"
              }
              description={
                meals.length === 0
                  ? "Save a meal and it’ll appear here, ready to revisit anytime."
                  : "Save a meal to start building your visual food diary."
              }
              {...(meals.length === 0 ? { cta: "Add your first meal" } : {})}
            />
          </div>
        ) : null}

        <section className="mt-7">
          <div className="grid grid-cols-3 gap-2">
            <SummaryStat icon={UtensilsCrossed} label="Meals saved" value={`${meals.length}`} />
            <SummaryStat icon={CalendarDays} label="Days logged" value={`${loggedDays}`} />
            <SummaryStat icon={Wallet} label="Total spent" value={formatRupiah(totalSpend)} />
          </div>

          <div className="mt-10 space-y-8">
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
  const previews = items.length > 4 ? items.slice(0, 3) : items;
  const overflow = items.length > 4 ? items.length - 3 : 0;
  const names = items
    .slice(0, 3)
    .map((meal) => meal.mealName || "Saved meal")
    .join(", ");

  return (
    <Link
      to="/memories/$date"
      params={{ date }}
      aria-label={`Open memories from ${formatDateLabel(date, { dateStyle: "full" })}`}
      className="memory-group press enter-card group block border-b border-border/70 px-1 pb-7 last:border-b-0 last:pb-0"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-[21px] font-extrabold leading-tight">
            {formatDateLabel(date, { weekday: "long", month: "short", day: "numeric" })}
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {items.length} {items.length === 1 ? "meal" : "meals"}
            {date === toDateKey(new Date()) ? " · Today" : ""}
          </p>
        </div>
        {overflow ? (
          <ChevronRight
            className="memory-chevron size-6 shrink-0 text-foreground"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {previews.map((meal) => (
          <FoodSticker
            key={meal.id}
            src={mealThumb(meal)}
            fallbackSrc={meal.processedImage || meal.originalImage}
            alt=""
            className="memory-preview-image aspect-square w-full rounded-[18px] object-cover shadow-[var(--shadow-pill)]"
          />
        ))}
        {overflow ? (
          <div className="relative grid aspect-square w-full place-items-center rounded-[18px] border-[3px] border-card bg-foreground text-[17px] font-bold text-background shadow-[var(--shadow-sticker)]">
            +{overflow}
            <ChevronRight
              className="absolute right-2.5 size-5"
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      <p className="mt-4 truncate text-[14px] text-muted-foreground">
        {names || "Saved meals"}
        {items.length > 3 ? " …" : ""}
      </p>
    </Link>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UtensilsCrossed | typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[20px] border border-border/50 bg-white p-3 shadow-[var(--shadow-card)]">
      <Icon className="size-5 text-accent" />
      <p className="mt-3 truncate text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[16px] font-bold">{value}</p>
    </div>
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
