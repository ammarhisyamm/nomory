import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  CircleHelp,
  Database,
  FileLock2,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  Trash2,
} from "lucide-react";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { getAuthStatus } from "@/lib/auth";
import { toast } from "@/lib/feedback";
import { useMeals } from "@/lib/meals";
import { signOut, updateProfileName } from "@/lib/password-auth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Nomory" },
      { name: "description", content: "Manage your Nomory account, privacy, and diary." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { meals, clearAll, cloudEnabled } = useMeals();
  const queryClient = useQueryClient();
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const user = auth?.user ?? null;
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
  }, [user?.id, user?.name]);
  const signOutUser = async () => {
    await signOut();
    await queryClient.invalidateQueries({ queryKey: ["auth"] });
    toast.success("You’re signed out.", { title: "See you next time" });
  };
  const reset = async () => {
    if (!confirm("Delete every saved meal and photo everywhere? This can’t be undone.")) return;
    try {
      await clearAll();
      toast.success("Your diary is clear.", { title: "Memories cleared" });
    } catch {
      toast.error("Check your connection and try clearing your diary again.", {
        title: "Memories not cleared",
      });
    }
  };
  const saveName = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.username) return;
    if (displayName.trim().length < 2) {
      toast.error("Use at least 2 characters for your display name.", { title: "Name is too short" });
      return;
    }
    setSavingName(true);
    try {
      const result = await updateProfileName({ data: { name: displayName } });
      if (!result.ok)
        return toast.error(result.error ?? "Try saving your display name again.", {
          title: "Profile not updated",
        });
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Your display name is updated.", { title: "Profile updated" });
    } catch {
      toast.error("Try saving your display name again.", { title: "Profile not updated" });
    } finally {
      setSavingName(false);
    }
  };
  return (
    <AppShell>
      <Page>
        <PageHeader
          title="Settings"
          subtitle="Manage your account, privacy, and diary."
          left={<BackToProfile />}
        />
        <SettingsGroup title="General">
          {user?.username ? (
            <form onSubmit={saveName} className="space-y-3 p-5">
              <label className="block text-[13px] font-bold" htmlFor="settings-display-name">
                Display name
              </label>
              <input
                id="settings-display-name"
                className="input-soft h-12 px-4 text-[15px] font-normal"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                maxLength={40}
              />
              <button
                type="submit"
                disabled={savingName}
                className="primary-button press flex h-12 w-full items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-accent-foreground disabled:opacity-60"
              >
                {savingName ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save name
              </button>
            </form>
          ) : null}
          <div
            className={`flex items-center gap-4 p-5 ${user?.username ? "border-t border-border/60" : ""}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-bold">
                {user?.username ? `@${user.username}` : (user?.name ?? "Nomory account")}
              </p>
              <p className="mt-1 truncate text-[13px] text-muted-foreground">
                {cloudEnabled ? "Synced across your devices" : "Stored on this device"}
              </p>
            </div>
            <span className="text-[13px] text-muted-foreground">Account</span>
          </div>
        </SettingsGroup>
        <SettingsGroup title="Account">
          {user?.username ? (
            <SettingsLink
              to="/settings/security"
              icon={KeyRound}
              title="Password & security"
              description="Update the password for this account."
            />
          ) : null}
          <SettingsLink
            to="/settings/privacy-data"
            icon={Database}
            title="Privacy & data"
            description="Sync status, storage, and a copy of your data."
            divided={Boolean(user?.username)}
          />
        </SettingsGroup>
        <SettingsGroup title="Help & legal">
          <SettingsLink
            to="/settings/help"
            icon={CircleHelp}
            title="Help center"
            description="Answers for saving, syncing, and managing memories."
          />
          <SettingsLink
            to="/settings/privacy-policy"
            icon={FileLock2}
            title="Privacy Policy"
            description="How Nomory handles your account and meal data."
            divided
          />
        </SettingsGroup>
        <SettingsGroup title="Danger zone" danger>
          <button
            type="button"
            onClick={reset}
            className="press flex w-full items-center gap-4 p-5 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted">
              <Trash2 className="size-[19px] text-destructive" strokeWidth={1.9} />
            </span>
            <span className="min-w-0">
              <span className="block text-[16px] font-bold text-destructive">Clear my diary</span>
              <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
                Permanently removes {meals.length} {meals.length === 1 ? "meal" : "meals"} and their
                photos.
              </span>
            </span>
          </button>
        </SettingsGroup>
        <SettingsGroup title="Session">
          <button
            type="button"
            onClick={signOutUser}
            className="press flex w-full items-center gap-4 p-5 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted">
              <LogOut className="size-[18px]" strokeWidth={1.9} />
            </span>
            <span className="text-[15px] font-semibold">Log out</span>
          </button>
        </SettingsGroup>
        {auth === undefined ? (
          <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-subtle">
            <Loader2 className="size-4 animate-spin" /> Loading account…
          </p>
        ) : null}
      </Page>
    </AppShell>
  );
}

function BackToProfile() {
  return (
    <Link
      to="/profile"
      aria-label="Back to profile"
      className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
    >
      <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
    </Link>
  );
}

function SettingsLink({
  to,
  icon: Icon,
  title,
  description,
  divided = false,
}: {
  to:
    "/settings/security" | "/settings/privacy-data" | "/settings/help" | "/settings/privacy-policy";
  icon: typeof KeyRound;
  title: string;
  description: string;
  divided?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`press flex items-center gap-3 p-5 text-left ${divided ? "border-t border-border/60" : ""}`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted">
        <Icon className="size-5" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.9} />
    </Link>
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
