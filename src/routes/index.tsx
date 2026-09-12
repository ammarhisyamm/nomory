import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Flame,
  Images,
  Plus,
  Search,
  Target,
  UtensilsCrossed,
} from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MealCard } from "@/components/meal-card";
import { StatPill } from "@/components/pills";
import { FoodSticker } from "@/components/food-sticker";
import { PageLoadingState } from "@/components/loading-state";
import { getAuthStatus } from "@/lib/auth";
import { getDailyGoal, getWeeklyInsight } from "@/lib/meal-insights";
import { formatDateLabel, mealImage, toDateKey, useMeals } from "@/lib/meals";

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
  const [dailyGoal, setDailyGoal] = useState(3);

  useEffect(() => {
    setDailyGoal(getDailyGoal(user?.id));
  }, [user?.id]);

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

  const recent = meals.filter((m) => m.mealDate !== todayKey).slice(0, 6);
  const progress = Math.min(todayMeals.length / dailyGoal, 1);
  const remaining = Math.max(dailyGoal - todayMeals.length, 0);
  const weeklyInsight = getWeeklyInsight(meals);

  return (
    <AppShell>
      <Page>
        <PageHeader
          title="Good food, brighter days."
          subtitle="Your meals, remembered — one photo at a time."
          right={
            <div className="flex items-center gap-2">
              <Link
                to="/search"
                aria-label="Search meals"
                className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
              >
                <Search className="size-[19px]" strokeWidth={1.9} />
              </Link>
              <Link
                to="/profile"
                aria-label="Profile"
                className="press grid size-11 place-items-center overflow-hidden rounded-full bg-accent-soft text-[15px] font-bold text-accent"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  (user?.name || user?.email || "N").charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <StatPill
            icon={CalendarDays}
            label={formatDateLabel(todayKey, { month: "short", day: "numeric" })}
          />
          <StatPill
            icon={UtensilsCrossed}
            label={`${todayMeals.length} ${todayMeals.length === 1 ? "meal" : "meals"} logged`}
          />
          <StatPill icon={Flame} label={`${streak} day streak`} />
          <StatPill
            icon={Images}
            label={`${meals.length} ${meals.length === 1 ? "memory" : "memories"}`}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <h2 className="mb-4 text-[22px] font-bold">Today</h2>
            <div className="space-y-4">
              {!ready ? <PageLoadingState label="Loading today's meals…" rows={2} /> : null}
              {todayMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}

              {ready && todayMeals.length > 0 ? (
                <Link to="/add" className="press flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-accent/35 bg-accent-soft/55 px-5 text-[15px] font-bold text-accent">
                  <Plus className="size-5" strokeWidth={2.2} />
                  Add another meal
                </Link>
              ) : null}

              {ready && todayMeals.length === 0 ? (
                <EmptyState
                  title="Ready for your first bite?"
                  description="Capture your next meal. We’ll remember the date and time for you."
                  cta="Add your first meal"
                />
              ) : null}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="surface-card p-5" aria-label="Daily goal">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
                  <Target className="size-[18px]" strokeWidth={2} />
                </span>
                <div>
                  <h2 className="text-[17px] font-bold">Today&apos;s rhythm</h2>
                  <p className="text-[13px] text-muted-foreground">
                    {remaining > 0
                      ? `${remaining} more ${remaining === 1 ? "meal" : "meals"} to reach your goal.`
                      : "Goal reached — your day is remembered."}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-[14px] font-semibold">
                  {todayMeals.length} of {dailyGoal} meals
                </p>
                <Link
                  to="/profile"
                  className="text-[13px] font-semibold text-accent underline-offset-4 hover:underline"
                >
                  Set goal
                </Link>
              </div>
            </section>

            <section className="surface-card p-5" aria-label="Weekly insight">
              <p className="text-[12px] font-bold tracking-[0.14em] text-accent uppercase">
                This week
              </p>
              <h2 className="mt-1 text-[17px] font-bold">A small pattern</h2>
              <p className="mt-2 text-[14px] leading-6 text-muted-foreground">
                {weeklyInsight.message}
              </p>
              {weeklyInsight.totalMeals > 0 ? (
                <p className="mt-3 text-[13px] font-semibold">
                  {weeklyInsight.totalMeals} {weeklyInsight.totalMeals === 1 ? "meal" : "meals"}{" "}
                  saved
                </p>
              ) : null}
            </section>

            <h2 className="text-[22px] font-bold">Recent memories</h2>
            {!ready ? null : recent.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border bg-card/45 p-5">
                <p className="text-[14px] leading-6 text-muted-foreground">
                  Older meals will appear here as your diary grows.
                </p>
              </div>
            ) : (
              <div className="surface-card grid grid-cols-3 gap-3 p-4">
                {recent.map((meal) => (
                  <Link key={meal.id} to="/meal/$id" params={{ id: meal.id }} className="press">
                    <FoodSticker
                      src={mealImage(meal)}
                      alt={meal.mealName || "Saved meal"}
                      className="size-full aspect-square"
                      rounded="rounded-[18px]"
                    />
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </Page>
    </AppShell>
  );
}
