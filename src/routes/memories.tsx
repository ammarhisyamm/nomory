import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { CalendarDays, ChevronRight, MapPin, Search, Star, UtensilsCrossed, Wallet } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealImage,
  mealImageFallback,
  mealThumb,
  toDateKey,
  useMeals,
  type Meal,
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
  const [selectedMeal, setSelectedMeal] = useState<{ meal: Meal; origin: DOMRect } | null>(null);

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
              <DayGroup
                key={date}
                date={date}
                items={items}
                selectedMealId={selectedMeal?.meal.id ?? null}
                onSelectMeal={(meal, origin) => setSelectedMeal({ meal, origin })}
              />
            ))}
          </div>
        </section>
        <MemoryFlipDialog selection={selectedMeal} onClose={() => setSelectedMeal(null)} />
      </Page>
    </AppShell>
  );
}

function DayGroup({
  date,
  items,
  selectedMealId,
  onSelectMeal,
}: {
  date: string;
  items: ReturnType<typeof useMeals>["meals"];
  selectedMealId: string | null;
  onSelectMeal: (meal: Meal, origin: DOMRect) => void;
}) {
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
            selected={selectedMealId === meal.id}
            onSelect={(origin) => onSelectMeal(meal, origin)}
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
  selected,
  onSelect,
}: {
  meal: Meal;
  selected: boolean;
  onSelect: (origin: DOMRect) => void;
}) {
  return (
    <button
      type="button"
      className="memory-thumb-button press relative aspect-square min-w-0 rounded-[18px] text-left"
      data-selected={selected}
      onClick={(event) => onSelect(event.currentTarget.getBoundingClientRect())}
      aria-label={`Open ${meal.mealName || "saved meal"} details`}
    >
      <FoodSticker
        src={mealThumb(meal)}
        fallbackSrc={meal.processedImage || meal.originalImage}
        alt=""
        className="memory-preview-image size-full rounded-[18px] object-cover shadow-[var(--shadow-pill)]"
      />
    </button>
  );
}

function MemoryFlipDialog({
  selection,
  onClose,
}: {
  selection: { meal: Meal; origin: DOMRect } | null;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const meal = selection?.meal ?? null;
  const close = useCallback(() => {
    setVisible(false);
    setClosing(true);
    // Close with the exact reverse of the open transition. Keep the
    // overlay mounted until the card finishes returning to its thumbnail.
    window.setTimeout(onClose, 760);
  }, [onClose]);

  useEffect(() => {
    if (!selection) {
      setVisible(false);
      setClosing(false);
      return;
    }
    setClosing(false);
    const frame = requestAnimationFrame(() => setVisible(true));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selection, close]);

  if (!selection || !meal) return null;
  const typeLabel = MEAL_TYPES.find((type) => type.value === meal.mealType)?.label ?? "Meal";
  const targetWidth = Math.min(350, window.innerWidth - 48);
  const originX = selection.origin.left + selection.origin.width / 2 - window.innerWidth / 2;
  const originY = selection.origin.top + selection.origin.height / 2 - window.innerHeight / 2;
  const originScale = selection.origin.width / targetWidth;
  const cardStyle = {
    "--memory-origin-x": `${originX}px`,
    "--memory-origin-y": `${originY}px`,
    "--memory-origin-scale": originScale,
  } as CSSProperties;

  return (
    <div
      className="memory-detail-overlay"
      data-open={visible}
      data-closing={closing}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-detail-title"
        className="memory-detail-card"
        style={cardStyle}
        data-open={visible}
        data-closing={closing}
        onClick={close}
      >
        <div className="memory-detail-flip" data-open={visible} data-closing={closing}>
          <div className="memory-detail-face memory-detail-front" aria-hidden="true">
            <FoodSticker
              src={mealThumb(meal)}
              fallbackSrc={mealImageFallback(meal)}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="memory-detail-face memory-detail-back">
            <p className="text-[11px] font-bold tracking-[0.14em] text-accent uppercase">Food memory</p>
            <h2 id="memory-detail-title" className="mt-1 font-display text-[24px] font-extrabold leading-tight">
              {meal.mealName || "Saved meal"}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">{typeLabel}</p>
            <FoodSticker
              src={mealImage(meal)}
              fallbackSrc={mealImageFallback(meal)}
              alt={meal.mealName || "Saved meal"}
              className="mx-auto mt-4 size-40 rounded-[26px] object-cover"
            />
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border/70 py-4">
              <DetailCell label="Date" value={formatDateLabel(meal.mealDate)} />
              <DetailCell label="Time" value={formatTimeLabel(meal.mealTime)} />
              <DetailCell label="Price" value={meal.price ? formatPrice(meal.price) : "—"} />
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground">Rating</p>
                <div className="mt-1 flex text-sunny" aria-label={meal.rating ? `${meal.rating} out of 5` : "Not rated"}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="size-3.5" fill={star <= meal.rating ? "currentColor" : "none"} strokeWidth={1.8} />
                  ))}
                </div>
              </div>
              <div className="col-span-2 border-t border-border/70 pt-3">
                <p className="text-[11px] font-semibold text-muted-foreground">Note</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-5">{meal.note || "No note added"}</p>
              </div>
              <div className="col-span-2 flex items-center gap-2 border-t border-border/70 pt-3">
                <span className="grid size-7 place-items-center rounded-full bg-accent-soft text-accent"><MapPin className="size-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground">Location</p>
                  <p className="truncate text-[13px]">{meal.location || "No location added"}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] font-semibold text-subtle">Tap the card to return</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-[13px] font-medium">{value}</p>
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
