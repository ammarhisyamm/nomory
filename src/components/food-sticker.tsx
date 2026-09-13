import { useState } from "react";
import { cn } from "@/lib/utils";

export function FoodSticker({
  src,
  alt,
  className,
  rounded = "rounded-[26px]",
}: {
  src: string;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed || !src ? "/illustrations/empty-meals.png" : src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("food-sticker pop-in size-24 object-cover", rounded, className)}
    />
  );
}
