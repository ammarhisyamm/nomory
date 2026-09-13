import { cn } from "@/lib/utils";

/**
 * Nomory wordmark — Baloo 2 ExtraBold in Nom Orange, googly eyes in both
 * o's, Sunny Yellow spark top-right. Playful tilt like the brand sheet.
 */
function EyeO({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block leading-none", className)}>
      o{/* eye white */}
      <span
        aria-hidden
        className="absolute overflow-hidden rounded-full bg-white"
        style={{
          width: "0.52em",
          height: "0.58em",
          left: "50%",
          top: "54%",
          transform: "translate(-50%, -50%) rotate(-6deg)",
        }}
      >
        {/* pupil — glances up-right like the brand */}
        <span
          className="absolute rounded-full bg-black"
          style={{ width: "0.26em", height: "0.28em", right: "0.02em", top: "0.08em" }}
        />
      </span>
    </span>
  );
}

function Sparks({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 28" aria-hidden className={className} fill="currentColor">
      <rect x="14" y="0" width="11" height="20" rx="5.5" transform="rotate(24 14 0)" />
      <rect x="2" y="14" width="11" height="20" rx="5.5" transform="rotate(-58 2 14) scale(0.72)" />
    </svg>
  );
}

export function NomoryLogo({
  className,
  withTagline = false,
}: {
  className?: string;
  withTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col", className)}>
      <span
        className="font-display relative inline-flex items-start leading-none font-extrabold tracking-tight text-nom"
        style={{ fontSize: "1em", transform: "rotate(-3deg)" }}
      >
        <span className="leading-none">N</span>
        <EyeO />
        <span className="leading-none">m</span>
        <EyeO />
        <span className="leading-none">ry</span>
        <Sparks className="ml-0.5 size-[0.32em] shrink-0 text-sunny" />
      </span>
      {withTagline ? (
        <span className="mt-1 text-[13px] font-medium text-muted-foreground">
          Your meals, remembered.
        </span>
      ) : null}
    </span>
  );
}

/**
 * Nomory app mark — orange squircle, white "n" with googly eyes,
 * sunny sparks. Used in nav, favicon, PWA icons.
 */
export function NomoryMark({ className }: { className?: string }) {
  return <img src="/icons/icon-192.png?v=3" alt="" aria-hidden="true" className={className} />;
}
