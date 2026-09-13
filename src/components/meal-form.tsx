import { MapPin, MessageSquarePlus, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MEAL_TYPES, type Meal, type MealType } from "@/lib/meals";

export type MealFormValues = {
  mealName: string;
  mealType: MealType;
  mealDate: string;
  mealTime: string;
  note: string;
  location: string;
  price: string;
  rating: number;
};

export function mealToForm(meal: Meal): MealFormValues {
  return {
    mealName: meal.mealName,
    mealType: meal.mealType,
    mealDate: meal.mealDate,
    mealTime: meal.mealTime,
    note: meal.note,
    location: meal.location || "",
    price: meal.price ? String(meal.price) : "",
    rating: meal.rating || 0,
  };
}

const fieldClass =
  "h-12 w-full rounded-[14px] border border-input bg-card px-4 text-[15px] outline-none shadow-[var(--shadow-card)] transition-[border-color,box-shadow] placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10";

function formatPrice(value: string) {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(Number(value));
}

export function MealForm({
  values,
  onChange,
}: {
  values: MealFormValues;
  onChange: (next: MealFormValues) => void;
}) {
  const [showNote, setShowNote] = useState(Boolean(values.note));
  const set = <K extends keyof MealFormValues>(key: K, value: MealFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="space-y-6">
      <Field label="Meal name">
        <input
          className={fieldClass}
          value={values.mealName}
          placeholder="Salmon bowl"
          onChange={(e) => set("mealName", e.target.value)}
        />
      </Field>

      <Field label="Meal type">
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => set("mealType", type.value)}
              className={cn(
                "press h-11 rounded-full text-[13.5px] font-semibold",
                values.mealType === type.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid min-w-0 gap-3">
        <Field label="Date">
          <input
            type="date"
            className={fieldClass}
            value={values.mealDate}
            onChange={(e) => set("mealDate", e.target.value)}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            className={fieldClass}
            value={values.mealTime}
            onChange={(e) => set("mealTime", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid min-w-0 gap-3">
        <Field label="Price">
          <input
            className={fieldClass}
            inputMode="numeric"
            type="text"
            value={formatPrice(values.price)}
            placeholder="0"
            onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))}
          />
        </Field>
        <Field label="Rating">
          <div
            className="flex h-12 items-center gap-1 rounded-[14px] border border-input bg-card px-3 shadow-[var(--shadow-card)]"
            role="radiogroup"
            aria-label="Rate this meal"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={values.rating === star}
                aria-label={`${star} out of 5 stars`}
                onClick={() => set("rating", values.rating === star ? 0 : star)}
                className="press rounded-full p-1 text-sunny focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Star className="size-5" fill={star <= values.rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div>
        <button
          type="button"
          aria-expanded={showNote}
          onClick={() => setShowNote(!showNote)}
          className="press inline-flex h-10 items-center gap-2 rounded-full bg-muted px-4 text-[13.5px] font-semibold text-muted-foreground"
        >
          <MessageSquarePlus className="size-4" />
          {showNote ? "Hide note" : "Add a note"}
        </button>
        {showNote ? (
          <textarea
            rows={3}
            className="mt-3 min-h-24 w-full resize-y rounded-[14px] border border-input bg-card px-4 py-3 text-[15px] leading-[1.45] outline-none shadow-[var(--shadow-card)] transition-[border-color,box-shadow] placeholder:text-subtle focus:border-accent focus:ring-2 focus:ring-accent/10"
            placeholder="What do you want to remember?"
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
          />
        ) : null}
      </div>

      <Field label="Location">
        <div className="relative">
          <MapPin
            className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-subtle"
            strokeWidth={1.9}
          />
          <input
            className={`${fieldClass} pl-11`}
            placeholder="Home, cafe, or restaurant"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={160}
          />
        </div>
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-foreground">{label}</p>
      {children}
    </div>
  );
}
