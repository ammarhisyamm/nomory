import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEAL_TYPES, type Meal, type MealType } from "@/lib/meals";
import { TagPill } from "./pills";

export type MealFormValues = {
  mealName: string;
  mealType: MealType;
  mealDate: string;
  mealTime: string;
  note: string;
  tags: string[];
};

export function mealToForm(meal: Meal): MealFormValues {
  return {
    mealName: meal.mealName,
    mealType: meal.mealType,
    mealDate: meal.mealDate,
    mealTime: meal.mealTime,
    note: meal.note,
    tags: meal.tags,
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
  const [tagDraft, setTagDraft] = useState("");
  const set = <K extends keyof MealFormValues>(key: K, value: MealFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const addTag = () => {
    const label = tagDraft.trim();
    if (!label || values.tags.includes(label)) return setTagDraft("");
    set("tags", [...values.tags, label]);
    setTagDraft("");
  };

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
        <div className="grid grid-cols-4 gap-2">
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

      <div className="grid grid-cols-2 gap-3">
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

      <Field label="Tags">
        <div className="flex gap-2">
          <input
            className={fieldClass}
            placeholder="Homemade, so good!"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button
            type="button"
            onClick={addTag}
            className="press h-12 shrink-0 rounded-[14px] bg-muted px-4 text-[14px] font-semibold"
          >
            Add
          </button>
        </div>
        {values.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {values.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => set("tags", values.tags.filter((t) => t !== tag))}
                className="press inline-flex items-center gap-1.5"
                aria-label={`Remove tag ${tag}`}
              >
                <TagPill>
                  <span className="inline-flex items-center gap-1.5">
                    {tag}
                    <X className="size-3.5" strokeWidth={2.2} />
                  </span>
                </TagPill>
              </button>
            ))}
          </div>
        ) : null}
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
