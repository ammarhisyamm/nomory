import { useEffect, useRef, useState } from "react";
import { Flame, Share2, X } from "lucide-react";

type StreakState = { days: number } | null;

export function StreakModal() {
  const [streak, setStreak] = useState<StreakState>(null);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onStreak = (event: Event) => {
      const days = Number((event as CustomEvent<{ days: number }>).detail.days);
      if (Number.isFinite(days) && days > 0) setStreak({ days });
    };
    window.addEventListener("nomory:streak", onStreak);
    return () => window.removeEventListener("nomory:streak", onStreak);
  }, []);

  useEffect(() => {
    if (!streak) return;
    continueRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStreak(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [streak]);

  if (!streak) return null;
  const days = streak.days;
  const today = new Date().toLocaleDateString(undefined, { weekday: "short" });
  const week = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
  const activeCount = Math.min(days, 7);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-foreground/25 p-0 backdrop-blur-[4px] sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setStreak(null);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="streak-title"
        className="streak-modal relative w-full max-w-[500px] overflow-hidden rounded-t-[32px] bg-card px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8 shadow-[0_-16px_50px_oklch(0.32_0.05_55/0.2)] sm:rounded-[32px] sm:pb-6"
      >
        <div aria-hidden className="streak-gradient absolute inset-x-0 top-0 h-48" />
        <span
          aria-hidden
          className="relative mx-auto mb-1 block h-1 w-10 rounded-full bg-border sm:hidden"
        />
        <button
          type="button"
          aria-label="Close streak message"
          onClick={() => setStreak(null)}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-card/75 shadow-[var(--shadow-pill)] backdrop-blur focus-visible:outline-2 focus-visible:outline-accent"
        >
          <X className="size-5" />
        </button>

        <div className="relative rounded-[26px] bg-card/35 px-4 pb-5 pt-4 text-center">
          <div className="mx-auto grid size-28 place-items-center rounded-full bg-accent-soft shadow-[var(--shadow-sticker)]">
            <Flame className="size-20 fill-accent text-accent" strokeWidth={1.4} />
          </div>
          <p className="mt-4 text-[12px] font-bold tracking-[0.16em] text-accent uppercase">
            Day {days}
          </p>
          <h2
            id="streak-title"
            className="mt-1 font-display text-[30px] font-extrabold tracking-tight"
          >
            You’re on a streak!
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-6 text-muted-foreground">
            Every meal you remember keeps the habit alive. Come back tomorrow to keep it going.
          </p>
        </div>

        <div
          className="relative mt-4 rounded-[22px] border border-border/70 bg-background/70 p-4"
          aria-label="This week's streak"
        >
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground">
            {week.map((day, index) => (
              <span key={`${day}-${index}`}>{index === 6 ? today : day}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1">
            {week.map((day, index) => (
              <span
                key={`${day}-dot`}
                className={`mx-auto grid size-9 place-items-center rounded-full ${index >= 7 - activeCount ? "bg-accent text-accent-foreground shadow-[var(--shadow-sticker)]" : "bg-muted text-subtle"}`}
              >
                {index >= 7 - activeCount ? <Flame className="size-4 fill-current" /> : ""}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-5 flex gap-2">
          <button
            type="button"
            aria-label="Share your streak"
            className="press grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Share2 className="size-5" />
          </button>
          <button
            ref={continueRef}
            type="button"
            onClick={() => setStreak(null)}
            className="press h-14 flex-1 rounded-full bg-foreground text-[15px] font-bold text-background focus-visible:outline-2 focus-visible:outline-accent"
          >
            Keep going
          </button>
        </div>
      </section>
    </div>
  );
}
