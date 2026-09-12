import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startGoogleSignIn } from "@/lib/auth";

export const Route = createFileRoute("/auth/google")({
  head: () => ({
    meta: [{ title: "Signing in — Morsel" }],
  }),
  component: GoogleSignInRoute,
});

function GoogleSignInRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    startGoogleSignIn({ data: { origin: window.location.origin } })
      .then((result) => {
        if (!alive) return;
        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.error("Google sign-in isn't set up on this deployment yet.");
          navigate({ to: "/profile" });
        }
      })
      .catch(() => {
        if (!alive) return;
        toast.error("Couldn't start Google sign-in. Try again.");
        navigate({ to: "/profile" });
      });
    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="size-8 animate-spin text-accent" strokeWidth={2} />
      <p className="text-[15px] text-muted-foreground">Taking you to Google…</p>
    </div>
  );
}
