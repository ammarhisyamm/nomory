import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/feedback";
import { startGoogleSignIn } from "@/lib/auth";

export const Route = createFileRoute("/auth/google")({
  head: () => ({
    meta: [{ title: "Signing in — Nomory" }],
  }),
  component: GoogleSignInRoute,
});

function GoogleSignInRoute() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isCallback = pathname === "/auth/google/callback";

  useEffect(() => {
    if (isCallback) return;
    let alive = true;
    startGoogleSignIn({ data: { origin: window.location.origin } })
      .then((result) => {
        if (!alive) return;
        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.error("Use another sign-in method for now.", {
            title: "Google sign-in unavailable",
          });
          navigate({ to: "/profile" });
        }
      })
      .catch(() => {
        if (!alive) return;
        toast.error("Try signing in with Google again.", { title: "Google sign-in failed" });
        navigate({ to: "/profile" });
      });
    return () => {
      alive = false;
    };
  }, [isCallback, navigate]);

  if (isCallback) return <Outlet />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="size-8 animate-spin text-accent" strokeWidth={2} />
      <p className="text-[15px] text-muted-foreground">Taking you to Google…</p>
    </div>
  );
}
