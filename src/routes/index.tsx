import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Flame, Images, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MealCard } from "@/components/meal-card";
import { PageLoadingState } from "@/components/loading-state";
import { getAuthStatus } from "@/lib/auth";
import { toDateKey, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nomory — Your meals, remembered" },
      {
        name: "description",
        content:
          "Nomory helps you remember what you eat, one photo at a time. Good food, brighter days.",
      },
      { property: "og:title", content: "Nomory — Your meals, remembered" },
      {
        property: "og:description",
        content: "Capture meals. Remember what you ate. Look back on your food memories.",
      },
    ],
  }),
  component: TodayPage,
});

function TodayPage() {
  const navigate = useNavigate();
  const { meals, ready, mealsByDate, streak } = useMeals();
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const user = auth?.user ?? null;
  const todayKey = toDateKey(new Date());
  const todayMeals = mealsByDate(todayKey);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Migrate the old Morsel flag forward.
    if (localStorage.getItem("morsel.onboarded") && !localStorage.getItem("nomory.onboarded")) {
      localStorage.setItem("nomory.onboarded", "1");
    }
    if (!localStorage.getItem("nomory.onboarded")) {
      navigate({ to: "/onboarding" });
    }
  }, [navigate]);

  const displayName = formatDisplayName(user?.name || "there");

  return (
    <AppShell>
      <Page>
        <p className="section-label mb-2">Nomory</p>
        <PageHeader title={`Good morning, ${displayName}.`} />

        <p className="mt-1 max-w-3xl text-[19px] leading-[1.45] text-muted-foreground">
          You&apos;ve captured{" "}
          <InlineStat
            icon={Images}
            value={`${todayMeals.length} ${todayMeals.length === 1 ? "memory" : "memories"}`}
          />{" "}
          today, saved{" "}
          <InlineStat
            icon={Bookmark}
            value={`${meals.length} ${meals.length === 1 ? "meal" : "meals"}`}
          />
          , and built a <InlineStat icon={Flame} value={`${streak} day streak`} />.
        </p>
        <WeekStreak meals={meals} streak={streak} />
        <section className="mt-9">
          <h2 className="mb-4 text-[22px] font-bold">Today</h2>
          <div className="space-y-4">
            {!ready ? <PageLoadingState label="Loading today's meals…" rows={2} /> : null}
            {todayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}

            {ready && todayMeals.length > 0 ? (
              <Link
                to="/add"
                className="press flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/35 bg-accent-soft/55 px-5 text-[15px] font-bold text-accent"
              >
                <Plus className="size-5" strokeWidth={2.2} />
                Add another meal
              </Link>
            ) : null}

            {ready && todayMeals.length === 0 ? (
              <EmptyState
                kind="today"
                title="Ready for your first bite?"
                description="Capture your next meal. We’ll remember the date and time for you."
                cta="Add your first meal"
              />
            ) : null}
          </div>
        </section>
      </Page>
    </AppShell>
  );
}

function formatDisplayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] || "there";
  return `${parts[0]} ${parts[parts.length - 1]?.charAt(0).toUpperCase()}.`;
}

function InlineStat({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-bold text-foreground">
      <Icon className="inline size-5 text-accent" strokeWidth={2.1} />
      {value}
    </span>
  );
}

function WeekStreak({ meals, streak }: { meals: { mealDate: string }[]; streak: number }) {
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const loggedDays = new Set(meals.map((meal) => meal.mealDate));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: toDateKey(date),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      active: loggedDays.has(toDateKey(date)),
      today: toDateKey(date) === toDateKey(today),
    };
  });

  return (
    <section
      className="mt-7 rounded-[28px] border border-border bg-card/65 px-4 py-5 shadow-[var(--shadow-card)]"
      aria-label="Daily streak"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">
            Daily streak
          </p>
          <p className="mt-1 text-[18px] font-bold">
            {streak > 0 ? `${streak} ${streak === 1 ? "day" : "days"} in a row` : "Start today"}
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
          <Flame className="size-6" fill="currentColor" strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {days.map((day) => (
          <div key={day.key} className="min-w-0 text-center">
            <p
              className={`mb-2 text-[11px] font-bold ${day.today ? "text-accent" : "text-subtle"}`}
            >
              {day.label}
            </p>
            <span
              className={`mx-auto grid size-9 place-items-center rounded-full ${day.active ? "bg-accent text-accent-foreground shadow-[var(--shadow-pill)]" : "border border-border bg-background text-subtle"}`}
              aria-label={`${day.label}: ${day.active ? "meal logged" : "no meal logged"}`}
            >
              {day.active ? <Flame className="size-4 fill-current" strokeWidth={2} /> : null}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
