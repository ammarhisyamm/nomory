import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type EmptyStateKind = "today" | "memories" | "calendar" | "profile" | "search";

export function EmptyState({
  title,
  description,
  cta,
  to = "/add",
  kind = "today",
  secondaryCta,
  onSecondary,
  compact = false,
}: {
  title: string;
  description: string;
  cta?: string;
  to?: "/" | "/add" | "/memories" | "/search";
  kind?: EmptyStateKind;
  secondaryCta?: string;
  onSecondary?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "enter-card flex w-full min-w-0 max-w-full flex-col items-center px-5 text-center",
        compact ? "py-8" : "py-10",
      )}
    >
      <img
        src={
          {
            today: "/illustrations/empty-today.png",
            memories: "/illustrations/empty-memories.png",
            calendar: "/illustrations/empty-calendar.png",
            profile: "/illustrations/empty-profile.png",
            search: "/illustrations/search-meals.png",
          }[kind]
        }
        alt=""
        className={cn("w-auto object-contain drop-shadow-sm", compact ? "h-28" : "h-36")}
      />
      <h3 className="mt-2 max-w-full break-words text-[20px] font-extrabold">{title}</h3>
      <p className="mt-2 max-w-sm text-[15px] leading-6 text-muted-foreground">{description}</p>
      {cta || secondaryCta ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {cta ? (
            <Link
              to={to}
              className="press flex h-12 items-center rounded-full bg-accent px-6 text-[15px] font-bold text-accent-foreground shadow-[var(--shadow-pill)]"
            >
              {cta}
            </Link>
          ) : null}
          {secondaryCta ? (
            <button
              type="button"
              onClick={onSecondary}
              className="press h-12 rounded-full bg-muted px-5 text-[14px] font-semibold text-muted-foreground"
            >
              {secondaryCta}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
