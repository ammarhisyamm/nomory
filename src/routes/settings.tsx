import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "@/lib/feedback";
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  Loader2,
  LogOut,
  RefreshCw,
  Target,
  Trash2,
} from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { getAuthStatus } from "@/lib/auth";
import { getDailyGoal, saveDailyGoal } from "@/lib/meal-insights";
import { changePassword, signOut } from "@/lib/password-auth";
import { useMeals } from "@/lib/meals";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Nomory" },
      { name: "description", content: "Manage your Nomory account, sync, and diary settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { meals, clearAll, cloudEnabled, syncing, syncNow } = useMeals();
  const queryClient = useQueryClient();
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const user = auth?.user ?? null;
  const [dailyGoal, setDailyGoal] = useState(3);
  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => setDailyGoal(getDailyGoal(user?.id)), [user?.id]);

  const updateGoal = (value: number) => {
    if (!saveDailyGoal(value, user?.id)) {
      toast.error("Couldn’t save the goal on this device. Try again.");
      return;
    }
    setDailyGoal(value);
    toast.success(`Daily goal set to ${value} ${value === 1 ? "meal" : "meals"}.`);
  };

  const sync = async () => {
    await syncNow();
    toast.success(cloudEnabled ? "Your memories are synced." : "Sync complete.");
  };

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
    toast.success("Your diary is clear.");
  };

  const signOutUser = async () => {
    await signOut();
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    toast.success("You’re signed out.");
  };

  const changePw = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPw || !nextPw) return toast.error("Isi password lama dan baru dulu ya.");
    if (nextPw.length < 8) return toast.error("Password baru minimal 8 karakter.");
    if (currentPw === nextPw) return toast.error("Password baru harus berbeda dari yang lama.");
    setChangingPw(true);
    try {
      const result = await changePassword({ data: { current: currentPw, next: nextPw } });
      if (!result.ok) return toast.error(result.error ?? "Gagal ganti password.");
      setCurrentPw("");
      setNextPw("");
      toast.success("Password berhasil diganti.");
    } catch {
      toast.error("Tidak bisa terhubung. Coba lagi.");
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <AppShell>
      <Page>
        <PageHeader
          title="Settings"
          subtitle="Manage your account and diary."
          right={
            <Link
              to="/profile"
              aria-label="Back to profile"
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
            </Link>
          }
        />

        <section className="grid gap-3" aria-label="Account and sync status">
          <div className="surface-card flex items-center gap-4 p-5">
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold ${cloudEnabled ? "bg-leaf-soft text-[#15803d]" : "bg-muted text-muted-foreground"}`}
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
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-bold">{user.name}</p>
                <p className="mt-1 truncate text-[14px] text-muted-foreground">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={signOutUser}
                aria-label="Sign out"
                className="press grid size-11 shrink-0 place-items-center rounded-full bg-muted"
              >
                <LogOut className="size-[18px] text-muted-foreground" strokeWidth={1.9} />
              </button>
            </div>
          ) : null}
        </section>

        <section className="mt-8" aria-labelledby="daily-goal-title">
          <h2 id="daily-goal-title" className="mb-4 text-[22px] font-bold">
            Daily meal goal
          </h2>
          <div className="surface-card p-5">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Target className="size-[19px]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-muted-foreground">
                  A gentle reminder, not a nutrition rule. Saved on this device.
                </p>
                <div
                  className="mt-4 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Choose daily meal goal"
                >
                  {[1, 2, 3, 4, 5].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => updateGoal(goal)}
                      aria-pressed={dailyGoal === goal}
                      className={`press min-w-11 rounded-full px-4 py-2 text-[14px] font-semibold ${dailyGoal === goal ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {user?.username ? (
          <form onSubmit={changePw} className="surface-card mt-4 space-y-3 p-5">
            <div>
              <p className="text-[16px] font-bold">Change password</p>
              <p className="mt-1 text-[14px] text-muted-foreground">Use at least 8 characters.</p>
            </div>
            <input
              type="password"
              value={currentPw}
              onChange={(event) => setCurrentPw(event.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className="h-12 w-full rounded-[14px] border border-input bg-card px-4 text-[15px] outline-none placeholder:text-subtle focus:border-accent"
            />
            <input
              type="password"
              value={nextPw}
              onChange={(event) => setNextPw(event.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              className="h-12 w-full rounded-[14px] border border-input bg-card px-4 text-[15px] outline-none placeholder:text-subtle focus:border-accent"
            />
            <button
              type="submit"
              disabled={changingPw}
              className="press flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[15px] font-semibold text-background disabled:opacity-60"
            >
              {changingPw ? <Loader2 className="size-4 animate-spin" strokeWidth={2.2} /> : null}
              Save new password
            </button>
          </form>
        ) : null}

        <section className="mt-8" aria-labelledby="danger-zone-title">
          <p id="danger-zone-title" className="section-label mb-3 text-destructive/80">
            Danger zone
          </p>
          <button
            type="button"
            onClick={reset}
            className="surface-card press flex w-full items-center gap-4 border-destructive/15 p-5 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted">
              <Trash2 className="size-[19px] text-destructive" strokeWidth={1.9} />
            </span>
            <span>
              <span className="block text-[16px] font-bold">Clear my diary</span>
              <span className="mt-1 block text-[14px] text-muted-foreground">
                Removes {meals.length} {meals.length === 1 ? "saved meal" : "saved meals"} from{" "}
                {cloudEnabled ? "this device and the cloud" : "this device"}.
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
