import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Cloud,
  CloudOff,
  Flame,
  Images,
  Loader2,
  LogOut,
  RefreshCw,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { StatPill } from "@/components/pills";
import { getAuthStatus, signOutFromGoogle } from "@/lib/auth";
import { toDateKey, useMeals } from "@/lib/meals";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Your food diary | Nomory" },
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
  const { meals, streak, clearAll, mealsByDate, cloudEnabled, syncing, syncNow } = useMeals();
  const queryClient = useQueryClient();
  const todayCount = mealsByDate(toDateKey(new Date())).length;
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const user = auth?.user ?? null;
  const initial = (user?.name || user?.email || "N").charAt(0).toUpperCase();

  const reset = async () => {
    if (
      !confirm(
        cloudEnabled
          ? "Delete every saved meal everywhere, including the cloud? This can't be undone."
          : "Delete every saved meal on this device? This can't be undone.",
      )
    )
      return;
    await clearAll();
    toast("Diary cleared");
  };

  const sync = async () => {
    await syncNow();
    toast(cloudEnabled ? "Synced with cloud" : "Sync finished");
  };

  const signOut = async () => {
    await signOutFromGoogle();
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    toast("Signed out");
  };

  return (
    <AppShell>
      <Page>
        <PageHeader
          title="Profile"
          subtitle={user ? user.email : "Your diary lives on this device."}
        />

        <div className="surface-card flex items-center gap-4 p-5">
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold ${
              cloudEnabled ? "bg-leaf-soft text-[#15803d]" : "bg-muted text-muted-foreground"
            }`}
          >
            {cloudEnabled ? (
              <Cloud className="size-4" strokeWidth={2} />
            ) : (
              <CloudOff className="size-4" strokeWidth={2} />
            )}
            {cloudEnabled ? "Cloud sync on" : user ? "Cloud not set up yet" : "On this device"}
          </span>
          {user ? (
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className="press ml-auto inline-flex h-10 items-center gap-2 rounded-full bg-muted px-4 text-[13px] font-semibold text-muted-foreground disabled:opacity-60"
            >
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} strokeWidth={2} />
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          ) : null}
        </div>

        {user ? (
          <div className="surface-card flex items-center gap-4 p-5">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="size-14 rounded-full border border-border object-cover"
              />
            ) : (
              <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-[20px] font-bold text-accent">
                {initial}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] font-bold">{user.name}</p>
              <p className="mt-1 truncate text-[14px] text-muted-foreground">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              className="press grid size-11 shrink-0 place-items-center rounded-full bg-muted"
            >
              <LogOut className="size-[18px] text-muted-foreground" strokeWidth={1.9} />
            </button>
          </div>
        ) : (
          <div className="surface-card flex items-center gap-4 p-5">
            <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-[20px] font-bold text-accent">
              N
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-bold">My Nomory diary</p>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {auth === undefined ? "Checking your account…" : "Saved privately on this device."}
              </p>
            </div>
          </div>
        )}

        {auth?.googleConfigured && !user ? (
          <a
            href="/auth/google"
            className="surface-card press mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-[20px] text-[15px] font-semibold"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.2-6.9-5.1L1.3 17.2C3.3 21.2 7.3 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.8-2.9z"
              />
              <path
                fill="#EA4335"
                d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.8 2.9c1-2.9 3.7-5 6.9-5z"
              />
            </svg>
            Continue with Google
          </a>
        ) : null}

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

        {auth === undefined ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-subtle">
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            Loading account…
          </p>
        ) : null}
      </Page>
    </AppShell>
  );
}
