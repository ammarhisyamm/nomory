import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Plus, Search, UtensilsCrossed, Wallet } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FilterPill } from "@/components/pills";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealThumb,
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
              {...(meals.length === 0 ? { cta: "Add your first meal" } : {})}
              {...(meals.length > 0 ? { secondaryCta: "Show all memories" } : {})}
              onSecondary={() => setFilter("all")}
            />
          </div>
        ) : null}

        <section className="mt-6 rounded-[30px] bg-card/55 p-4 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
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

          <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryStat icon={UtensilsCrossed} label="Meals saved" value={`${meals.length}`} />
            <SummaryStat icon={CalendarDays} label="Days logged" value={`${loggedDays}`} />
            <SummaryStat icon={Wallet} label="Total spent" value={formatRupiah(totalSpend)} />
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
      className="press enter-card group block border-b border-border/70 px-1 pb-7 last:border-b-0 last:pb-0"
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
        <ChevronRight
          className="size-6 shrink-0 text-foreground transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </div>
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {previews.map((meal) => (
          <img
            key={meal.id}
            src={mealThumb(meal)}
            alt=""
            loading="lazy"
            className="aspect-square w-full rounded-[18px] object-cover shadow-[var(--shadow-pill)] transition-transform group-hover:scale-[1.01]"
          />
        ))}
        {overflow ? (
          <div className="grid aspect-square place-items-center rounded-[18px] bg-foreground text-[17px] font-bold text-background shadow-[var(--shadow-pill)]">
            +{overflow}
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
    <div className="min-w-0 rounded-[20px] border border-border/60 bg-background/55 p-3">
      <Icon className="size-5 text-accent" />
      <p className="mt-3 truncate text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[17px] font-bold">{value}</p>
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
