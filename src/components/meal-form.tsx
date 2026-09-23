import { Check, MapPin, MessageSquarePlus, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MEAL_TYPES, type Meal, type MealType } from "@/lib/meals";

export type MenuItemFormValue = { name: string; price: string };

export type MealFormValues = {
  mealName: string;
  menuItems: MenuItemFormValue[];
  mealType: MealType;
  mealDate: string;
  mealTime: string;
  note: string;
  location: string;
  price: string;
  rating: number;
};

export function mealToForm(meal: Meal): MealFormValues {
  const items = meal.menuItems?.length
    ? meal.menuItems
    : meal.mealName
      ? [{ name: meal.mealName, price: meal.price }]
      : [{ name: "", price: 0 }];
  return {
    mealName: meal.mealName,
    menuItems: items.map((item) => ({
      name: item.name,
      price: item.price ? String(item.price) : "",
    })),
    mealType: meal.mealType,
    mealDate: meal.mealDate,
    mealTime: meal.mealTime,
    note: meal.note,
    location: meal.location || "",
    price: meal.price ? String(meal.price) : "",
    rating: meal.rating || 0,
  };
}

const fieldClass = "input-soft block h-12 w-full min-w-0 max-w-full px-4 text-[15px]";

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
  const updateMenuItem = (index: number, key: keyof MenuItemFormValue, value: string) => {
    const menuItems = values.menuItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item,
    );
    onChange({
      ...values,
      menuItems,
      price: String(menuItems.reduce((total, item) => total + Number(item.price || 0), 0)),
    });
  };

  return (
    <div className="w-full min-w-0 space-y-5">
      <Field label="Meal title">
        <input
          className={fieldClass}
          value={values.mealName}
          placeholder="Salmon bowl"
          onChange={(e) => set("mealName", e.target.value)}
        />
      </Field>

      <Field label="Menu items">
        <div className="space-y-2">
          {values.menuItems.map((item, index) => (
            <div key={index} className="grid min-w-0 grid-cols-[minmax(0,1fr)_40px] gap-2">
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  className={`${fieldClass} min-w-0`}
                  value={item.name}
                  placeholder={`Menu ${index + 1}`}
                  aria-label={`Menu item ${index + 1} name`}
                  onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                />
                <input
                  className={`${fieldClass} min-w-0`}
                  inputMode="numeric"
                  type="text"
                  value={formatPrice(item.price)}
                  placeholder="Price"
                  aria-label={`Menu item ${index + 1} price`}
                  onChange={(e) =>
                    updateMenuItem(index, "price", e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>
              <button
                type="button"
                aria-label={`Remove menu item ${index + 1}`}
                disabled={values.menuItems.length === 1}
                onClick={() => {
                  const menuItems = values.menuItems.filter((_, itemIndex) => itemIndex !== index);
                  onChange({
                    ...values,
                    menuItems,
                    price: String(
                      menuItems.reduce((total, entry) => total + Number(entry.price || 0), 0),
                    ),
                  });
                }}
                className="rounded-[14px] bg-muted text-lg text-muted-foreground disabled:opacity-30"
              >
                −
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("menuItems", [...values.menuItems, { name: "", price: "" }])}
            className="press text-[13px] font-bold text-accent"
          >
            + Add another menu item
          </button>
          <p className="text-[12px] text-muted-foreground">
            Total: {formatPrice(values.price) || "0"}
          </p>
        </div>
      </Field>

      <Field label="Meal type">
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {MEAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => set("mealType", type.value)}
              data-selected={values.mealType === type.value}
              className={cn(
                "meal-type-option relative text-[13.5px] font-semibold",
                values.mealType === type.value ? "text-accent" : "text-muted-foreground",
              )}
            >
              <span>{type.label}</span>
              {values.mealType === type.value ? (
                <Check className="absolute top-3 right-3 size-4 text-accent" strokeWidth={2.5} />
              ) : null}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5">
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

      <div className="grid w-full min-w-0 grid-cols-1 gap-3">
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
        <div className="note-reveal" data-open={showNote} aria-hidden={!showNote}>
          <textarea
            rows={3}
            tabIndex={showNote ? 0 : -1}
            className="input-soft mt-3 block min-h-24 w-full min-w-0 max-w-full resize-y px-4 py-3 text-[15px] leading-[1.45]"
            placeholder="What do you want to remember?"
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </div>
      </div>

      <Field label="Location">
        <div className="relative w-full min-w-0">
          <span className="form-location-icon pointer-events-none absolute top-1/2 left-3 size-8 -translate-y-1/2 rounded-[10px]">
            <MapPin className="size-[16px]" strokeWidth={2.1} />
          </span>
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
    <div className="w-full min-w-0">
      <p className="mb-2 text-[13px] font-bold text-foreground">{label}</p>
      {children}
    </div>
  );
}
