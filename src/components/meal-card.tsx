import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";
import { FoodSticker } from "./food-sticker";
import { formatTimeLabel, mealImage, type Meal } from "@/lib/meals";

const savedLabel: Record<Meal["mealType"], string> = {
  breakfast: "Breakfast saved!",
  lunch: "Lunch saved!",
  dinner: "Dinner saved!",
  snack: "Snack saved!",
  drink: "Drink saved!",
};

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <Link
      to="/meal/$id"
      params={{ id: meal.id }}
      className="surface-card press enter-card flex gap-4 p-5"
    >
      <FoodSticker src={mealImage(meal)} alt={meal.mealName || "Saved meal"} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-bold">{meal.mealName || savedLabel[meal.mealType]}</p>
            <p className="mt-1 line-clamp-2 text-[14.5px] leading-[1.45] text-muted-foreground">
              {meal.note || savedLabel[meal.mealType]}
            </p>
          </div>
          <span className="shrink-0 text-[13px] font-medium text-subtle">
            {formatTimeLabel(meal.mealTime)}
          </span>
        </div>
        {meal.location ? (
          <p className="mt-3 flex min-w-0 items-center gap-1.5 truncate text-[12.5px] text-subtle">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.9} />
            <span className="truncate">{meal.location}</span>
          </p>
        ) : null}
      </div>
      <ChevronRight className="mt-1 size-[18px] shrink-0 self-center text-subtle" strokeWidth={2} />
    </Link>
  );
}
