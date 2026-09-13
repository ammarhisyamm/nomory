import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Images, Plus, Sparkles, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { getAuthStatus } from "@/lib/auth";
import { NomoryLogo, NomoryMark } from "./nomory-logo";

const destinations = [
  { to: "/", label: "Today", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const mobileDestinations = [
  { to: "/", label: "Home", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const hideMobileNav = pathname === "/add";

  useEffect(() => {
    if (auth && !auth.user) navigate({ to: "/login" });
  }, [auth, navigate]);

  // Require login before showing any app content (also avoids a flash of
  // another user's cached meals on shared devices).
  if (!auth?.user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <NomoryMark className="size-20 animate-pulse text-[64px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-background">
      <div className="mx-auto flex w-full min-w-0 max-w-[430px]">
        {/* Desktop rail */}
        <aside className="hidden">
          <div className="mb-8 px-3">
            <NomoryLogo className="text-[26px]" withTagline />
          </div>
          {destinations.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "press flex h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-semibold",
                isActive(to)
                  ? "bg-accent-soft text-foreground"
                  : "text-muted-foreground hover:bg-card/60",
              )}
            >
              <Icon
                className={cn("size-[20px]", isActive(to) && "text-accent")}
                strokeWidth={1.9}
              />
              {label}
            </Link>
          ))}
          <Link
            to="/add"
            className="press mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-bold text-accent-foreground shadow-[var(--shadow-pill)]"
          >
            <Plus className="size-[19px]" strokeWidth={2.2} />
            Add Meal
          </Link>
        </aside>

        <main className="w-full min-w-0 max-w-full flex-1 overflow-x-hidden pb-28">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(14px,env(safe-area-inset-bottom))]",
          hideMobileNav && "hidden",
        )}
      >
        <div className="mx-auto flex max-w-[430px] items-center gap-2.5">
          <div className="grid min-h-[64px] min-w-0 flex-1 grid-cols-4 rounded-[28px] border border-white/80 bg-card/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-2xl">
            {mobileDestinations.map((d) => (
              <NavItem
                key={d.to}
                {...d}
                active={isActive(d.to) || (d.to === "/profile" && pathname.startsWith("/settings"))}
              />
            ))}
          </div>
          <Link
            to="/add"
            aria-label="Add a meal"
            className="press grid size-14 shrink-0 touch-manipulation place-items-center rounded-full border border-white/80 bg-card/85 text-foreground shadow-[var(--shadow-card)] backdrop-blur-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Plus className="size-7" strokeWidth={1.9} />
          </Link>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon: Icon, active }: { to: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex min-h-12 min-w-12 touch-manipulation flex-col items-center justify-center gap-1 rounded-[20px] text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        active
          ? "bg-white/65 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.8),var(--shadow-pill)] backdrop-blur-md"
          : "text-muted-foreground",
      )}
    >
      <Icon className={cn("size-[21px]", active && "text-accent")} strokeWidth={2} />
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  left,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex min-w-0 items-start justify-between gap-3 pt-7 pb-6">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {left ? <div className="shrink-0">{left}</div> : null}
        <div className="min-w-0 flex-1">
          {eyebrow}
          <h1 className="font-display break-words text-[29px] leading-[1.08] font-extrabold tracking-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-xl text-[15px] leading-6 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full min-w-0 max-w-full overflow-x-hidden px-4">{children}</div>;
}
