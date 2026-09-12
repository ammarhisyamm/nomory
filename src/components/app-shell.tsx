import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Images, Plus, Sparkles, User } from "lucide-react";
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

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1240px]">
        {/* Desktop rail */}
        <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col gap-1 border-r border-border/70 px-5 py-8 lg:flex">
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

        <main className="min-w-0 flex-1 pb-28 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[0_-8px_24px_oklch(0.32_0.05_55/0.06)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 items-center px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
          {destinations.slice(0, 2).map((d) => (
            <NavItem key={d.to} {...d} active={isActive(d.to)} />
          ))}
          <div className="flex justify-center">
            <Link
              to="/add"
              aria-label="Add meal"
              className="press grid size-14 -translate-y-4 place-items-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-sticker)]"
            >
              <Plus className="size-6" strokeWidth={2.2} />
            </Link>
          </div>
          {destinations.slice(2).map((d) => (
            <NavItem key={d.to} {...d} active={isActive(d.to)} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Sparkles;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
        active ? "text-foreground" : "text-subtle",
      )}
    >
      {active ? <span className="absolute top-0 h-1 w-6 rounded-full bg-accent" /> : null}
      <Icon className={cn("size-[21px]", active && "text-accent")} strokeWidth={1.9} />
      {label}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 pt-7 pb-6 sm:pt-9">
      <div>
        {eyebrow}
        <h1 className="font-display text-[29px] leading-[1.08] font-extrabold tracking-tight sm:text-[34px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-2 max-w-xl text-[15px] leading-6 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="px-5 sm:px-6 lg:px-8">{children}</div>;
}
