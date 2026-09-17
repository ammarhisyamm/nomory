import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { resetPassword } from "@/lib/password-recovery";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Choose a new password — Nomory" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^[a-f0-9]{64}$/.test(token))
      return setError("Link reset tidak valid atau sudah kedaluwarsa.");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== confirm) return setError("Konfirmasi password belum sama.");
    setBusy(true);
    try {
      const result = await resetPassword({ data: { token, password } });
      if (!result.ok)
        return setError(result.error ?? "Link reset tidak valid atau sudah kedaluwarsa.");
      navigate({ to: "/login" });
    } catch {
      setError("Tidak bisa memperbarui password. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="flex min-h-screen flex-col bg-background px-6 py-12">
      <div className="mx-auto w-full max-w-[430px]">
        <Link
          to="/login"
          aria-label="Back to login"
          className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
        >
          <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
        </Link>
        <form onSubmit={submit} className="surface-card mt-12 space-y-4 p-6">
          <h1 className="font-display text-[28px] font-extrabold tracking-tight">
            Choose a new password
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Use at least 8 characters. This reset link can only be used once.
          </p>
          {[
            { id: "new-password", label: "New password", value: password, set: setPassword },
            { id: "confirm-password", label: "Confirm password", value: confirm, set: setConfirm },
          ].map((field) => (
            <label
              key={field.id}
              htmlFor={field.id}
              className="block text-[13px] font-semibold text-muted-foreground"
            >
              {field.label}
              <input
                id={field.id}
                type={show ? "text" : "password"}
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
                autoComplete={field.id === "new-password" ? "new-password" : "new-password"}
                className="input-soft mt-2 h-12 w-full px-4 text-[15px]"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="press flex items-center gap-2 text-[13px] font-semibold text-muted-foreground"
          >
            <span className="grid size-8 place-items-center rounded-full bg-muted">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </span>
            {show ? "Hide passwords" : "Show passwords"}
          </button>
          {error ? (
            <p
              role="alert"
              className="rounded-[14px] bg-destructive/10 px-4 py-3 text-[14px] font-medium text-destructive"
            >
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="primary-button press flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-accent-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null} Update password
          </button>
        </form>
      </div>
    </main>
  );
}
