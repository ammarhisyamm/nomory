import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SettingsDetail } from "@/components/settings-detail";
import { toast } from "@/lib/feedback";
import { changePassword } from "@/lib/password-auth";
import { setRecoveryEmail } from "@/lib/password-recovery";

export const Route = createFileRoute("/settings_/security")({
  head: () => ({ meta: [{ title: "Password & security | Nomory" }] }),
  component: SecurityPage,
});
function SecurityPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [recoveryEmail, setRecoveryEmailValue] = useState("");
  const [recoveryCurrent, setRecoveryCurrent] = useState("");
  const [savingRecovery, setSavingRecovery] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!current || !next)
      return toast.error("Enter both passwords to continue.", { title: "Password update needed" });
    if (next.length < 8)
      return toast.error("Use at least 8 characters for the new password.", {
        title: "Password is too short",
      });
    setSaving(true);
    try {
      const result = await changePassword({ data: { current, next } });
      if (!result.ok)
        return toast.error(result.error ?? "Try updating your password again.", {
          title: "Password not updated",
        });
      setCurrent("");
      setNext("");
      toast.success("Your password is now up to date.", { title: "Password updated" });
    } catch {
      toast.error("Try updating your password again.", { title: "Password not updated" });
    } finally {
      setSaving(false);
    }
  };
  const saveRecoveryEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recoveryEmail.includes("@"))
      return toast.error("Enter an email address you can access.", {
        title: "Email address needed",
      });
    setSavingRecovery(true);
    try {
      const result = await setRecoveryEmail({
        data: { email: recoveryEmail, currentPassword: recoveryCurrent },
      });
      if (!result.ok)
        return toast.error(result.error ?? "Try saving your recovery email again.", {
          title: "Recovery email not saved",
        });
      toast.success("Your recovery email is ready for password resets.", {
        title: "Recovery email saved",
      });
      setRecoveryCurrent("");
    } catch {
      toast.error("Try saving your recovery email again.", { title: "Recovery email not saved" });
    } finally {
      setSavingRecovery(false);
    }
  };
  return (
    <SettingsDetail title="Password & security" subtitle="Keep your Nomory account secure.">
      <form onSubmit={submit} className="surface-card space-y-4 p-5">
        <label className="block text-[14px] font-semibold">
          Current password
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className="input-soft mt-2 h-13 px-4 font-normal"
          />
        </label>
        <label className="block text-[14px] font-semibold">
          New password
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className="input-soft mt-2 h-13 px-4 font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="primary-button press flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-accent-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null} Save new password
        </button>
      </form>
      <form onSubmit={saveRecoveryEmail} className="surface-card mt-5 space-y-4 p-5">
        <div>
          <h2 className="text-[16px] font-bold">Recovery email</h2>
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            Use an email you can access to receive password reset links.
          </p>
        </div>
        <label className="block text-[14px] font-semibold" htmlFor="recovery-email">
          Email address
          <input
            id="recovery-email"
            type="email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmailValue(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className="input-soft mt-2 h-13 w-full px-4 font-normal"
          />
        </label>
        <label className="block text-[14px] font-semibold" htmlFor="recovery-current-password">
          Current password
          <input
            id="recovery-current-password"
            type="password"
            value={recoveryCurrent}
            onChange={(e) => setRecoveryCurrent(e.target.value)}
            autoComplete="current-password"
            className="input-soft mt-2 h-13 w-full px-4 font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={savingRecovery}
          className="primary-button press flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-accent-foreground disabled:opacity-60"
        >
          {savingRecovery ? <Loader2 className="size-4 animate-spin" /> : null} Save recovery email
        </button>
      </form>
    </SettingsDetail>
  );
}
