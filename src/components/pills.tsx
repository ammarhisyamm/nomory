import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-full bg-card px-4 shadow-[var(--shadow-pill)]">
      <Icon className="size-[17px] text-accent" strokeWidth={2} />
      <span className="text-[13.5px] font-medium">{label}</span>
    </div>
  );
}

export function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-3 py-1.5 text-[12.5px] font-medium text-muted-foreground">
      {children}
    </span>
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
