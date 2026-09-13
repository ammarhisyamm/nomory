import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Flame, Images, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MealCard } from "@/components/meal-card";
import { StatPill } from "@/components/pills";
import { FoodSticker } from "@/components/food-sticker";
import { PageLoadingState } from "@/components/loading-state";
import { getAuthStatus } from "@/lib/auth";
import { getWeeklyInsight } from "@/lib/meal-insights";
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
  const weeklyInsight = getWeeklyInsight(meals);
  const displayName = formatDisplayName(user?.name || "there");

  return (
    <AppShell>
      <Page>
        <PageHeader title={`Good morning, ${displayName}.`} />

        <p className="mt-1 max-w-3xl text-[19px] leading-[1.45] text-muted-foreground sm:text-[24px]">
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
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
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
                  title="Ready for your first bite?"
                  description="Capture your next meal. We’ll remember the date and time for you."
                  cta="Add your first meal"
                />
              ) : null}
            </div>
          </section>

          <aside className="space-y-4">
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
