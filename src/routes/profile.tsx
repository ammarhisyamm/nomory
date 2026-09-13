import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogIn, Settings } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import { getAuthStatus } from "@/lib/auth";
import { mealThumb, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Your food diary | Nomory" },
      {
        name: "description",
        content: "Your Nomory food diary, saved as a visual collection of meals.",
      },
      { property: "og:title", content: "Profile — Your food diary" },
      {
        property: "og:description",
        content: "Your Nomory food diary, saved as a visual collection of meals.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { meals, ready } = useMeals();
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const user = auth?.user ?? null;
  const initial = (user?.name || user?.email || "N").charAt(0).toUpperCase();

  return (
    <AppShell>
      <Page>
        <PageHeader
          title="Profile"
          subtitle={user ? "Your food diary in one place." : "Your diary lives on this device."}
          right={
            <Link
              to="/settings"
              aria-label="Open settings"
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <Settings className="size-[19px]" strokeWidth={1.9} />
            </Link>
          }
        />

        <section className="surface-card flex items-center gap-4 p-5" aria-label="Profile account">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="size-16 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="grid size-16 place-items-center rounded-full bg-accent-soft text-[22px] font-bold text-accent">
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-bold">
              {user?.name || (user?.username ? `@${user.username}` : "My Nomory diary")}
            </p>
            <p className="mt-1 truncate text-[14px] text-muted-foreground">
              {user?.username
                ? `@${user.username}`
                : user?.email || "Saved privately on this device."}
            </p>
          </div>
        </section>

        {!user ? (
          <Link
            to="/login"
            className="press mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-[20px] bg-accent text-[15px] font-semibold text-accent-foreground"
          >
            <LogIn className="size-5" strokeWidth={2} />
            Sign in or create an account
          </Link>
        ) : null}

        {auth?.googleConfigured && !user ? (
          <a
            href="/auth/google"
            className="surface-card press mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-[20px] text-[15px] font-semibold"
          >
            <span className="grid size-5 place-items-center text-[15px] font-bold text-[#4285F4]">
              G
            </span>
            Continue with Google
          </a>
        ) : null}

        <section className="mt-7" aria-labelledby="saved-meals-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="saved-meals-title" className="text-[22px] font-bold">
              Saved meals
            </h2>
            {meals.length > 0 ? (
              <Link
                to="/memories"
                className="text-[13px] font-semibold text-accent hover:underline"
              >
                View all
              </Link>
            ) : null}
          </div>
          {ready && meals.length === 0 ? (
            <EmptyState
              kind="profile"
              title="Your food grid starts here"
              description="Save a meal and it will appear here as a visual memory."
              cta="Add your first meal"
            />
          ) : (
            <div className="grid grid-cols-3 gap-0" aria-label="Saved meal photos">
              {meals.map((meal) => (
                <Link
                  key={meal.id}
                  to="/meal/$id"
                  params={{ id: meal.id }}
                  aria-label={`Open ${meal.mealName || "saved meal"}`}
                  className="press aspect-square overflow-hidden bg-muted"
                >
                  <FoodSticker
                    src={mealThumb(meal)}
                    fallbackSrc={meal.processedImage || meal.originalImage}
                    alt={meal.mealName || "Saved meal"}
                    className="size-full rounded-none !border-0 !shadow-none object-cover"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </Page>
    </AppShell>
  );
}
