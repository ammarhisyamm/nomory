import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/password-recovery";
import { NomoryLogo } from "@/components/nomory-logo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Nomory" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@"))
      return setError("Masukkan email pemulihan yang valid.");
    setBusy(true);
    try {
      await requestPasswordReset({ data: { email } });
      setSent(true);
    } catch {
      setError("Tidak bisa memproses permintaan. Coba lagi sebentar.");
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
        <div className="mt-12 text-center">
          <NomoryLogo className="text-[42px]" withTagline />
        </div>
        <section className="surface-card mt-8 p-6">
          {sent ? (
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-accent/10 text-accent">
                <Mail className="size-6" />
              </span>
              <h1 className="font-display mt-5 text-[28px] font-extrabold tracking-tight">
                Check your inbox
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                If that email has a Nomory recovery address, we sent a reset link. The link expires
                in 15 minutes.
              </p>
              <Link
                to="/login"
                className="primary-button press mt-6 flex h-13 items-center justify-center rounded-full text-[15px] font-semibold text-accent-foreground"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h1 className="font-display text-[28px] font-extrabold tracking-tight">
                Forgot password?
              </h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Enter your recovery email and we’ll send a secure reset link.
              </p>
              <label
                htmlFor="recovery-email"
                className="mt-6 block text-[13px] font-semibold text-muted-foreground"
              >
                Recovery email
              </label>
              <input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="input-soft mt-2 h-12 w-full px-4 text-[15px]"
              />
              {error ? (
                <p
                  role="alert"
                  className="mt-3 rounded-[14px] bg-destructive/10 px-4 py-3 text-[14px] font-medium text-destructive"
                >
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="primary-button press mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-accent-foreground disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : null} Send reset link
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
