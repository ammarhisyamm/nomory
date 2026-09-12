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
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("food-sticker pop-in size-24 object-cover", rounded, className)}
    />
  );
}
