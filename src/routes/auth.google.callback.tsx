import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/feedback";
import { z } from "zod";
import { completeGoogleSignIn, finishGoogleSignIn } from "@/lib/auth";

const searchSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        if (error || !code || !state) {
          return new Response(null, {
            status: 302,
            headers: { location: new URL("/login", url).toString() },
          });
        }
        const result = await finishGoogleSignIn({
          code,
          state,
          redirectUri: `${url.origin}/auth/google/callback`,
        });
        if (!result.ok) {
          return new Response(null, {
            status: 302,
            headers: { location: new URL("/login", url).toString() },
          });
        }
        return new Response(null, {
          status: 302,
          headers: {
            location: new URL(result.needsOnboarding ? "/onboarding" : "/", url).toString(),
          },
        });
      },
    },
  },
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Signing in — Nomory" }],
  }),
  component: GoogleCallbackRoute,
});

function GoogleCallbackRoute() {
  const navigate = useNavigate();
  const { code, state, error } = Route.useSearch();

  useEffect(() => {
    if (error || !code || !state) {
      toast.error(error || "Google sign-in was cancelled.");
      navigate({ to: "/profile" });
      return;
    }
    let alive = true;
    completeGoogleSignIn({
      data: {
        code,
        state,
        redirectUri: `${window.location.origin}/auth/google/callback`,
      },
    })
      .then((result) => {
        if (!alive) return;
        if (result.ok) {
          toast.success("Signed in with Google!", { title: "Welcome to Nomory" });
          navigate({ to: result.needsOnboarding ? "/onboarding" : "/" });
        } else {
          toast.error(result.error ?? "Couldn't complete Google sign-in.");
          navigate({ to: "/profile" });
        }
      })
      .catch(() => {
        if (!alive) return;
        toast.error("Couldn't complete Google sign-in. Try again.");
        navigate({ to: "/profile" });
      });
    return () => {
      alive = false;
    };
  }, [code, state, error, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Loader2 className="size-8 animate-spin text-accent" strokeWidth={2} />
      <p className="text-[15px] text-muted-foreground">Finishing sign-in…</p>
    </div>
  );
}
