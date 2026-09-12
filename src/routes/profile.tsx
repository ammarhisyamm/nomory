import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Flame, Images, Trash2, UtensilsCrossed } from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { StatPill } from "@/components/pills";
import { toDateKey, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Your food diary | Morsel" },
      {
        name: "description",
        content: "Your diary stats and settings. Meals are saved privately on this device.",
      },
      { property: "og:title", content: "Profile — Your food diary" },
      {
        property: "og:description",
        content: "Your diary stats and settings. Meals are saved privately on this device.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { meals, streak, clearAll, mealsByDate } = useMeals();
  const todayCount = mealsByDate(toDateKey(new Date())).length;

  const reset = async () => {
    if (!confirm("Delete every saved meal on this device? This can't be undone.")) return;
    await clearAll();
    toast("Diary cleared");
  };

  return (
    <AppShell>
      <Page>
        <PageHeader title="Profile" subtitle="Your diary lives on this device." />

        <div className="surface-card flex items-center gap-4 p-5">
          <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-[20px] font-bold text-accent">
            M
          </span>
          <div>
            <p className="text-[17px] font-bold">My food diary</p>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Saved privately on this device.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <StatPill icon={Images} label={`${meals.length} memories`} />
          <StatPill icon={UtensilsCrossed} label={`${todayCount} today`} />
          <StatPill icon={Flame} label={`${streak} day streak`} />
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-[22px] font-bold">Settings</h2>
          <button
            type="button"
            onClick={reset}
            className="surface-card press flex w-full items-center gap-4 p-5 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted">
              <Trash2 className="size-[19px] text-destructive" strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-[16px] font-bold">Clear my diary</span>
              <span className="mt-1 block text-[14px] text-muted-foreground">
                Removes every saved meal and photo from this device.
              </span>
            </span>
          </button>
        </section>
      </Page>
    </AppShell>
  );
}
