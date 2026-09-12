import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { NomoryLogo } from "@/components/nomory-logo";
import { getAuthStatus } from "@/lib/auth";
import { getPasswordAuthStatus, signInWithPassword, signUpWithPassword } from "@/lib/password-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — Nomory" },
      {
        name: "description",
        content: "Masuk ke Nomory dengan username dan password.",
      },
      { property: "og:title", content: "Masuk — Nomory" },
    ],
  }),
  component: LoginPage,
});

type Mode = "login" | "register";

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const { data: pwStatus } = useQuery({
    queryKey: ["password-auth-status"],
    queryFn: getPasswordAuthStatus,
  });

  useEffect(() => {
    if (auth?.user) navigate({ to: "/" });
  }, [auth, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Isi username dan password dulu ya.");
      return;
    }
    setBusy(true);
    try {
      const result =
        mode === "login"
          ? await signInWithPassword({ data: { username, password } })
          : await signUpWithPassword({ data: { username, password, name } });
      if (result.ok) {
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        toast.success(
          mode === "login" ? "Selamat datang kembali!" : "Akun dibuat. Selamat datang!",
        );
        navigate({ to: "/" });
      } else {
        setError(result.error ?? "Gagal. Coba lagi.");
      }
    } catch {
      setError("Tidak bisa terhubung. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-16 pb-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="mt-8 flex flex-col items-center text-center">
          <NomoryLogo className="text-[44px]" withTagline />
          <h1 className="font-display mt-6 text-[30px] leading-tight font-extrabold tracking-tight">
            {mode === "login" ? "Welcome back!" : "Join Nomory!"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {mode === "login"
              ? "Masuk untuk sync makananmu di semua perangkat."
              : "Bikin akun untuk sync makananmu di semua perangkat."}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-muted p-1.5">
          {(["login", "register"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                "press h-11 rounded-full text-[14.5px] font-bold",
                mode === m
                  ? "bg-card text-foreground shadow-[var(--shadow-pill)]"
                  : "text-muted-foreground",
              )}
            >
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {pwStatus && !pwStatus.available ? (
          <div className="surface-card mt-4 flex gap-3 p-5 text-left">
            <TriangleAlert className="size-5 shrink-0 text-accent" strokeWidth={2} />
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Login username belum tersedia — database cloud belum disiapkan di deployment ini.
              Sementara kamu tetap bisa pakai Nomory di perangkat ini tanpa login.
            </p>
          </div>
        ) : null}

        <form onSubmit={submit} className="surface-card mt-4 space-y-4 p-6">
          {mode === "register" ? (
            <div>
              <label
                htmlFor="nomory-name"
                className="mb-2 block text-[13px] font-semibold text-muted-foreground"
              >
                Nama tampilan <span className="font-normal">(opsional)</span>
              </label>
              <input
                id="nomory-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth. Bunda"
                maxLength={40}
                autoComplete="nickname"
                className="h-12 w-full rounded-[14px] border border-input bg-card px-4 text-[15px] outline-none placeholder:text-subtle focus:border-accent"
              />
            </div>
          ) : null}

          <div>
            <label
              htmlFor="nomory-username"
              className="mb-2 block text-[13px] font-semibold text-muted-foreground"
            >
              Username
            </label>
            <input
              id="nomory-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="cth. bunda_hebat"
              maxLength={20}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full rounded-[14px] border border-input bg-card px-4 text-[15px] outline-none placeholder:text-subtle focus:border-accent"
            />
          </div>

          <div>
            <label
              htmlFor="nomory-password"
              className="mb-2 block text-[13px] font-semibold text-muted-foreground"
            >
              Password{" "}
              {mode === "register" ? <span className="font-normal">(min. 8 karakter)</span> : null}
            </label>
            <div className="relative">
              <input
                id="nomory-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                maxLength={128}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="h-12 w-full rounded-[14px] border border-input bg-card px-4 pr-12 text-[15px] outline-none placeholder:text-subtle focus:border-accent"
              />
              <button
                type="button"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPassword(!showPassword)}
                className="press absolute top-1/2 right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-[18px]" strokeWidth={1.9} />
                ) : (
                  <Eye className="size-[18px]" strokeWidth={1.9} />
                )}
              </button>
            </div>
          </div>

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
            className="press flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-[16px] font-semibold text-accent-foreground disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-5 animate-spin" strokeWidth={2.2} /> : null}
            {mode === "login" ? "Masuk" : "Buat akun"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] leading-relaxed text-subtle">
          Password disimpan sebagai hash aman dan tidak pernah terlihat oleh siapa pun.
        </p>
      </div>
    </div>
  );
}
