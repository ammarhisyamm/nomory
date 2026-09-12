import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Images, Plus, Sparkles, User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const destinations = [
  { to: "/", label: "Today", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/memories", label: "Memories", icon: Images },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-[1240px]">
        {/* Desktop rail */}
        <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col gap-1 px-5 py-8 lg:flex">
          <div className="mb-8 flex items-center gap-2 px-3">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="size-[18px]" strokeWidth={2} />
            </span>
            <span className="text-[17px] font-bold tracking-tight">Morsel</span>
          </div>
          {destinations.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "press flex h-12 items-center gap-3 rounded-full px-4 text-[15px] font-medium",
                isActive(to)
                  ? "bg-card text-foreground shadow-[var(--shadow-pill)]"
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
            className="press mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold text-accent-foreground shadow-[var(--shadow-pill)]"
          >
            <Plus className="size-[19px]" strokeWidth={2.2} />
            Add Meal
          </Link>
        </aside>

        <main className="min-w-0 flex-1 pb-28 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden">
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
        "flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-medium",
        active ? "text-foreground" : "text-subtle",
      )}
    >
      <Icon className={cn("size-[21px]", active && "text-accent")} strokeWidth={1.9} />
      {label}
    </Link>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 pt-8 pb-6">
      <div>
        <h1 className="text-[30px] leading-[1.08] font-bold sm:text-[34px]">{title}</h1>
        {subtitle ? <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="px-5 sm:px-6 lg:px-8">{children}</div>;
}
