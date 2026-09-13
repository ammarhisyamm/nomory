import { useState } from "react";
import { cn } from "@/lib/utils";

export function FoodSticker({
  src,
  fallbackSrc,
  alt,
  className,
  rounded = "rounded-[26px]",
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const imageSrc = !failed ? src : !fallbackFailed && fallbackSrc ? fallbackSrc : "";
  return (
    <img
      src={imageSrc || "/illustrations/empty-meals.png"}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (!failed) setFailed(true);
        else setFallbackFailed(true);
      }}
      className={cn("food-sticker pop-in size-24 object-cover", rounded, className)}
    />
  );
}
