import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type EmptyStateKind = "meals" | "search";

export function EmptyState({
  title,
  description,
  cta,
  to = "/add",
  kind = "meals",
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
        "surface-card enter-card relative flex w-full min-w-0 max-w-full flex-col items-center overflow-hidden px-5 text-center sm:px-6",
        compact ? "py-8" : "py-10 sm:py-12",
      )}
    >
      <span
        aria-hidden
        className="absolute -top-16 -left-12 size-36 rounded-full bg-sunny-soft/70 blur-2xl"
      />
      <span
        aria-hidden
        className="absolute -right-12 -bottom-16 size-36 rounded-full bg-blush-soft/80 blur-2xl"
      />
      <img
        src={
          kind === "search" ? "/illustrations/search-meals.png" : "/illustrations/empty-meals.png"
        }
        alt=""
        className={cn(
          "relative z-10 w-auto object-contain drop-shadow-sm",
          compact ? "h-28" : "h-36 sm:h-40",
        )}
      />
      <h3 className="relative z-10 mt-2 max-w-full break-words text-[20px] font-extrabold">
        {title}
      </h3>
      <p className="relative z-10 mt-2 max-w-sm text-[15px] leading-6 text-muted-foreground">
        {description}
      </p>
      {cta || secondaryCta ? (
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2">
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
