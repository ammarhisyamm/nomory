import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SettingsDetail } from "@/components/settings-detail";
import { toast } from "@/lib/feedback";
import { changePassword } from "@/lib/password-auth";

export const Route = createFileRoute("/settings_/security")({
  head: () => ({ meta: [{ title: "Password & security | Nomory" }] }),
  component: SecurityPage,
});
function SecurityPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!current || !next) return toast.error("Enter your current and new password.");
    if (next.length < 8) return toast.error("Use at least 8 characters for the new password.");
    setSaving(true);
    try {
      const result = await changePassword({ data: { current, next } });
      if (!result.ok) return toast.error(result.error ?? "Couldn’t update your password.");
      setCurrent("");
      setNext("");
      toast.success("Your password is now up to date.", { title: "Password updated" });
    } catch {
      toast.error("Couldn’t update your password. Try again.");
    } finally {
      setSaving(false);
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
            className="input-soft mt-2 h-13 w-full px-4 font-normal"
          />
        </label>
        <label className="block text-[14px] font-semibold">
          New password
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            className="input-soft mt-2 h-13 w-full px-4 font-normal"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="press flex h-13 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[15px] font-semibold text-background disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null} Save new password
        </button>
      </form>
    </SettingsDetail>
  );
}
