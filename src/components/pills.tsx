import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-2xl bg-card px-3 shadow-[var(--shadow-pill)]">
      <Icon className="size-[17px] text-accent" strokeWidth={2} />
      <span className="truncate text-[13.5px] font-semibold">{label}</span>
    </div>
  );
}

export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press h-11 shrink-0 rounded-full px-4 text-[13.5px] font-semibold",
        active
          ? "bg-foreground text-background"
          : "bg-card text-muted-foreground shadow-[var(--shadow-pill)]",
      )}
    >
      {children}
    </button>
  );
}
