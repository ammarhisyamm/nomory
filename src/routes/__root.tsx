import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MealsProvider } from "../lib/meals";
import { FeedbackModal } from "../components/feedback-modal";
import { StreakModal } from "../components/streak-modal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card relative w-full max-w-md overflow-hidden px-6 py-10 text-center">
        <span
          aria-hidden
          className="absolute -top-16 -left-12 size-36 rounded-full bg-sunny-soft blur-2xl"
        />
        <img
          src="/illustrations/search-meals.png"
          alt=""
          className="relative mx-auto h-40 w-auto object-contain"
        />
        <p className="section-label mt-2">404 · Lost bite</p>
        <h1 className="mt-2 text-[26px] font-extrabold text-foreground">This page wandered off</h1>
        <p className="mx-auto mt-2 max-w-xs text-[15px] leading-6 text-muted-foreground">
          Let’s get you back to today’s meals.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="primary-button press inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-bold text-accent-foreground"
          >
            Back to today
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card w-full max-w-md px-6 py-10 text-center">
        <img
          src="/illustrations/empty-meals.png"
          alt=""
          className="mx-auto h-36 w-auto object-contain"
        />
        <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-foreground">
          We dropped this one
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-[15px] leading-6 text-muted-foreground">
          Your saved meals are safe. Try loading the page again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="primary-button press inline-flex h-12 items-center justify-center rounded-full px-5 text-[15px] font-bold text-accent-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="press inline-flex h-12 items-center justify-center rounded-full bg-muted px-5 text-[15px] font-semibold text-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Nomory — Your meals, remembered" },
      {
        name: "description",
        content:
          "Nomory helps you remember what you eat, one photo at a time. Good food, brighter days.",
      },
      { name: "theme-color", content: "#FF5A1F" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Nomory" },
      { property: "og:title", content: "Nomory — Your meals, remembered" },
      {
        property: "og:description",
        content: "Capture meals. Remember what you ate. Look back on your food memories.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Baloo 2 (display) + Satoshi (body) per Nomory brand guidelines
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap",
      },
      { rel: "icon", href: "/favicon.png?v=3", type: "image/png", sizes: "512x512" },
      { rel: "shortcut icon", href: "/favicon.png?v=3", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png?v=3" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="nomory-brand" className="sr-only">
          Nomory is a private food memory diary for saving meals and photos.
        </div>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MealsProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <FeedbackModal />
        <StreakModal />
      </MealsProvider>
    </QueryClientProvider>
  );
}
