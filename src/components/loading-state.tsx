import { Skeleton } from "@/components/ui/skeleton";

export function PageLoadingState({
  label = "Loading your memories…",
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div role="status" aria-live="polite" className="py-10">
      <span className="sr-only">{label}</span>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: rows }, (_, item) => (
          <div key={item} className="surface-card flex items-center gap-4 p-4">
            <Skeleton className="size-20 shrink-0 rounded-[22px]" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-2/3 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
