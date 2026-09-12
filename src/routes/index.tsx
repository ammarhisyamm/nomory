import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronRight,
  Flame,
  Images,
  Plus,
  Search,
  UtensilsCrossed,
} from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MealCard } from "@/components/meal-card";
import { StatPill } from "@/components/pills";
import { FoodSticker } from "@/components/food-sticker";
import { getAuthStatus } from "@/lib/auth";
import { formatDateLabel, mealImage, toDateKey, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morsel — Remember what you ate" },
      {
        name: "description",
        content:
          "A visual food diary. Save a photo of each meal and revisit your food memories by day, month or mood.",
      },
      { property: "og:title", content: "Morsel — Remember what you ate" },
      {
        property: "og:description",
        content: "Save meals with a quick photo and build your own visual food diary.",
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
    if (!localStorage.getItem("morsel.onboarded")) {
      navigate({ to: "/onboarding" });
    }
  }, [navigate]);

  const recent = meals.filter((m) => m.mealDate !== todayKey).slice(0, 6);

  return (
    <AppShell>
      <Page>
        <PageHeader
          title="What did you eat today?"
          subtitle="Capture meals. Keep your memories."
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
                  (user?.name || user?.email || "M").charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          }
        />

        <div className="flex flex-wrap gap-2">
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
              {todayMeals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}

              <Link to="/add" className="surface-card press flex items-center gap-4 p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Plus className="size-6" strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-bold">Add Meal</span>
                  <span className="mt-1 block text-[14.5px] text-muted-foreground">
                    Take a photo or upload one from your gallery.
                  </span>
                </span>
                <ChevronRight className="size-[18px] text-subtle" strokeWidth={2} />
              </Link>

              {ready && todayMeals.length === 0 ? (
                <EmptyState
                  title="Nothing logged yet"
                  description="Take a photo of your first meal today."
                />
              ) : null}
            </div>
          </section>

          <aside className="space-y-4">
            <h2 className="text-[22px] font-bold">Recent memories</h2>
            {recent.length === 0 ? (
              <p className="text-[14.5px] text-muted-foreground">Your food diary starts here.</p>
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
