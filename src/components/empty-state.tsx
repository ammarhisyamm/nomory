import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: string;
}) {
  return (
    <div className="surface-card enter-card flex flex-col items-center px-6 py-12 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent-soft">
        <Camera className="size-6 text-accent" strokeWidth={1.9} />
      </span>
      <h3 className="mt-5 text-[19px] font-bold">{title}</h3>
      <p className="mt-2 max-w-xs text-[14.5px] text-muted-foreground">{description}</p>
      {cta ? (
        <Link
          to="/add"
          className="press mt-6 flex h-12 items-center rounded-full bg-accent px-6 text-[15px] font-semibold text-accent-foreground"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}
