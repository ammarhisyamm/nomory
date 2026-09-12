import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEAL_TYPES, type Meal, type MealType } from "@/lib/meals";

export type MealFormValues = {
  mealName: string;
  mealType: MealType;
  mealDate: string;
  mealTime: string;
  note: string;
  location: string;
};

export function mealToForm(meal: Meal): MealFormValues {
  return {
    mealName: meal.mealName,
    mealType: meal.mealType,
    mealDate: meal.mealDate,
    mealTime: meal.mealTime,
    note: meal.note,
    location: meal.location || "",
  };
}

const fieldClass =
  "h-12 w-full rounded-[14px] border border-input bg-card px-4 text-[15px] outline-none placeholder:text-subtle focus:border-accent";

export function MealForm({
  values,
  onChange,
}: {
  values: MealFormValues;
  onChange: (next: MealFormValues) => void;
}) {
  const set = <K extends keyof MealFormValues>(key: K, value: MealFormValues[K]) =>
    onChange({ ...values, [key]: value });

  return (
    <div className="space-y-5">
      <Field label="Meal name">
        <input
          className={fieldClass}
          value={values.mealName}
          placeholder="Salmon bowl"
          onChange={(e) => set("mealName", e.target.value)}
        />
      </Field>

      <Field label="Meal type">
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
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

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
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

      <Field label="Note">
        <textarea
          rows={3}
          className="w-full resize-none rounded-[14px] border border-input bg-card px-4 py-3 text-[15px] leading-[1.45] outline-none placeholder:text-subtle focus:border-accent"
          placeholder="Add a note to remember."
          value={values.note}
          onChange={(e) => set("note", e.target.value)}
        />
      </Field>

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
      <p className="mb-2 text-[13px] font-semibold text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
