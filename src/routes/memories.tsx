import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Search, UtensilsCrossed, Wallet } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import { MEAL_TYPES, formatDateLabel, mealThumb, toDateKey, useMeals } from "@/lib/meals";

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

          <div className="mt-8 space-y-6">
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
  const [flippedMealId, setFlippedMealId] = useState<string | null>(null);
  const previews = items.length > 4 ? items.slice(0, 3) : items;
  const overflow = items.length > 4 ? items.length - 3 : 0;
  const names = items
    .slice(0, 3)
    .map((meal) => meal.mealName || "Saved meal")
    .join(", ");

  return (
    <article className="memory-group enter-card block border-b border-border/70 px-1 pb-5 last:border-b-0 last:pb-0">
      <Link
        to="/memories/$date"
        params={{ date }}
        aria-label={`Open memories from ${formatDateLabel(date, { dateStyle: "full" })}`}
        className="press mb-4 flex items-center justify-between gap-3 rounded-xl text-left"
      >
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
      </Link>
      <div className="grid grid-cols-4 gap-2.5">
        {previews.map((meal) => (
          <FlipMealPreview
            key={meal.id}
            meal={meal}
            flipped={flippedMealId === meal.id}
            onFlip={() => setFlippedMealId((current) => (current === meal.id ? null : meal.id))}
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
    </article>
  );
}

function FlipMealPreview({
  meal,
  flipped,
  onFlip,
}: {
  meal: ReturnType<typeof useMeals>["meals"][number];
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div className="memory-flip" data-flipped={flipped}>
      <div className="memory-flip-inner">
        <button type="button" className="memory-flip-face memory-flip-front" onClick={onFlip} aria-label={`Show details for ${meal.mealName || "saved meal"}`}>
          <FoodSticker
            src={mealThumb(meal)}
            fallbackSrc={meal.processedImage || meal.originalImage}
            alt=""
            className="memory-preview-image size-full rounded-[18px] object-cover shadow-[var(--shadow-pill)]"
          />
        </button>
        <button type="button" className="memory-flip-face memory-flip-back" onClick={onFlip} aria-label={`Hide details for ${meal.mealName || "saved meal"}`}>
          <span className="line-clamp-2 text-[12px] font-bold leading-tight">{meal.mealName || "Saved meal"}</span>
          <span className="mt-1 text-[10px] text-muted-foreground">
            {MEAL_TYPES.find((type) => type.value === meal.mealType)?.label ?? "Meal"}
          </span>
          <span className="mt-2 text-[11px] font-semibold text-accent">{meal.price ? formatPrice(meal.price) : "No price"}</span>
          <span className="mt-1 text-[10px] text-sunny">{meal.rating ? `${meal.rating}/5 ★` : "Not rated"}</span>
        </button>
      </div>
    </div>
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

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}
