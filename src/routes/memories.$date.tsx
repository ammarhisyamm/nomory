import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { MealCard } from "@/components/meal-card";
import { PageLoadingState } from "@/components/loading-state";
import { formatDateLabel, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/memories/$date")({
  head: ({ params }) => ({
    meta: [
      { title: `${formatDateLabel(params.date)} — Memories | Nomory` },
      { name: "description", content: "Revisit every meal saved on this day." },
    ],
  }),
  component: MemoryDayPage,
});

function MemoryDayPage() {
  const { date } = Route.useParams();
  const { meals, ready } = useMeals();
  const dayMeals = meals.filter((meal) => meal.mealDate === date);

  if (!ready) {
    return (
      <AppShell>
        <Page>
          <PageLoadingState label="Loading this day’s memories…" rows={3} />
        </Page>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Page>
        <PageHeader
          title={formatDateLabel(date, { weekday: "long", month: "short", day: "numeric" })}
          subtitle={`${dayMeals.length} ${dayMeals.length === 1 ? "meal" : "meals"} saved on this day.`}
          left={
            <Link
              to="/memories"
              aria-label="Back to memories"
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
            </Link>
          }
        />

        {dayMeals.length ? (
          <section className="space-y-3" aria-label="Meals saved on this day">
            {dayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </section>
        ) : (
          <EmptyState
            kind="calendar"
            title="No memories on this day"
            description="This day may have been removed or is no longer available."
            cta="Back to memories"
            to="/memories"
          />
        )}
      </Page>
    </AppShell>
  );
}
