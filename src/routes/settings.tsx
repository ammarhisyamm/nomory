import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/lib/feedback";
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  Download,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { getAuthStatus } from "@/lib/auth";
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
  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      product: "Nomory",
      memories: meals,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nomory-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Your Nomory data is ready to download.", { title: "Export ready" });
  };

  const sync = async () => {
    await syncNow();
    toast.success(cloudEnabled ? "Your memories are synced." : "Sync complete.", {
      title: cloudEnabled ? "Up to date" : "Sync complete",
    });
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
    toast.success("Your diary is clear.", { title: "Memories cleared" });
  };

  const signOutUser = async () => {
    await signOut();
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    toast.success("You’re signed out.", { title: "See you next time" });
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
      toast.success("Password berhasil diganti.", { title: "Password updated" });
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
          left={
            <Link
              to="/profile"
              aria-label="Back to profile"
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
            </Link>
          }
        />

        <SettingsGroup title="Account">
          <div className="flex items-center gap-4 p-5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-bold">{user?.name ?? "On this device"}</p>
              <p className="mt-1 truncate text-[14px] text-muted-foreground">
                {user?.email ?? "Sign in to sync your memories across devices."}
              </p>
            </div>
            {user ? (
              <button
                type="button"
                onClick={signOutUser}
                className="press grid size-11 shrink-0 place-items-center rounded-full bg-muted"
                aria-label="Sign out"
              >
                <LogOut className="size-[18px] text-muted-foreground" strokeWidth={1.9} />
              </button>
            ) : null}
          </div>
        </SettingsGroup>

        <SettingsGroup title="Privacy & data">
          <div className="flex items-center gap-3 p-5">
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-full ${cloudEnabled ? "bg-leaf-soft text-[#15803d]" : "bg-muted text-muted-foreground"}`}
            >
              {cloudEnabled ? <Cloud className="size-5" /> : <CloudOff className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">Cloud sync</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                {cloudEnabled
                  ? "Your signed-in memories are synced."
                  : "Your memories stay on this device."}
              </p>
            </div>
            {user ? (
              <button
                type="button"
                onClick={sync}
                disabled={syncing}
                className="press inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-3.5 text-[12px] font-bold text-foreground disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing…" : "Sync"}
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-3 border-t border-border/60 p-5">
            <ShieldCheck className="size-5 shrink-0 text-accent" strokeWidth={1.9} />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">Download a copy</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                Export your saved meal details as JSON.
              </p>
            </div>
            <button
              type="button"
              onClick={exportData}
              className="press inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted px-3.5 text-[12px] font-bold text-foreground"
            >
              <Download className="size-4" /> Export
            </button>
          </div>
        </SettingsGroup>

        {user?.username ? (
          <SettingsGroup title="Security">
            <form onSubmit={changePw} className="space-y-3 p-5">
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
          </SettingsGroup>
        ) : null}

        <SettingsGroup title="Danger zone" danger>
          <button
            type="button"
            onClick={reset}
            className="press flex w-full items-center gap-4 border-destructive/15 p-5 text-left"
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
        </SettingsGroup>

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

function SettingsGroup({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section className="mt-7" aria-label={title}>
      <h2 className={`mb-3 text-[21px] font-bold ${danger ? "text-destructive" : ""}`}>{title}</h2>
      <div className="surface-card overflow-hidden">{children}</div>
    </section>
  );
}
