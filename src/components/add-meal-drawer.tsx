import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, TriangleAlert, X } from "lucide-react";
import { toast } from "@/lib/feedback";
import { FoodSticker } from "@/components/food-sticker";
import { MealForm, type MealFormValues } from "@/components/meal-form";
import { processPhoto } from "@/lib/image";
import {
  calculateStreak,
  suggestMealType,
  toDateKey,
  toTimeKey,
  useMeals,
  type Meal,
} from "@/lib/meals";
import { cn } from "@/lib/utils";

type Step = "choose" | "processing" | "edit";

type Photo = {
  original: string;
  processed: string;
  thumbnail: string;
  cutout: boolean;
};

const PROCESSING_PHASES = ["Finding your food.", "Cleaning up the photo.", "Almost ready."];

function freshValues(): MealFormValues {
  const now = new Date();
  return {
    mealName: "",
    mealType: suggestMealType(toTimeKey(now)),
    mealDate: toDateKey(now),
    mealTime: toTimeKey(now),
    note: "",
    location: "",
    price: "",
    rating: 0,
  };
}

export function AddMealDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { meals, saveMeal } = useMeals();
  const [step, setStep] = useState<Step>("choose");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [useOriginal, setUseOriginal] = useState(false);
  const [values, setValues] = useState<MealFormValues>(freshValues);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, saving]);

  useEffect(() => {
    if (step !== "processing") return;
    setPhase(0);
    const timer = setInterval(
      () => setPhase((current) => (current + 1) % PROCESSING_PHASES.length),
      900,
    );
    return () => clearInterval(timer);
  }, [step]);

  if (!open) return null;

  const close = () => {
    if (saving) return;
    setStep("choose");
    setPhoto(null);
    onClose();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setStep("processing");
    try {
      const result = await processPhoto(file);
      setPhoto(result);
      setUseOriginal(false);
      setValues(freshValues());
      setStep("edit");
    } catch {
      toast.error("Couldn’t upload this photo. Try again.", { title: "Photo upload failed" });
      setStep("choose");
    }
  };

  const save = async () => {
    if (!photo) return;
    setSaving(true);
    try {
      const now = Date.now();
      const meal: Meal = {
        id: crypto.randomUUID(),
        originalImage: photo.original,
        processedImage: photo.processed,
        thumbnailImage: photo.thumbnail,
        useOriginal,
        mealName: values.mealName.trim(),
        mealType: values.mealType,
        note: values.note.trim(),
        location: values.location.trim(),
        price: Number(values.price) || 0,
        rating: values.rating,
        mealDate: values.mealDate,
        mealTime: values.mealTime,
        createdAt: now,
        updatedAt: now,
      };
      const startsNewDay = !meals.some((item) => item.mealDate === meal.mealDate);
      await saveMeal(meal);
      if (startsNewDay && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("nomory:streak", { detail: { days: calculateStreak([...meals, meal]) } }),
        );
      } else {
        toast.success(
          values.mealName ? `“${values.mealName}” is saved to your memories.` : "Memory saved.",
          { title: "Meal remembered" },
        );
      }
      close();
    } catch {
      toast.error("We couldn’t save this memory. Try again.", { title: "Memory not saved" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/25 p-0 backdrop-blur-[3px] sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Close add meal"
        className="absolute inset-0 cursor-default"
        onClick={close}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-meal-drawer-title"
        className="sheet-in relative z-10 max-h-[calc(100dvh-12px)] w-full max-w-[520px] overflow-y-auto rounded-t-[32px] bg-background px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_60px_oklch(0.32_0.05_55/0.2)] sm:max-h-[min(860px,calc(100dvh-40px))] sm:rounded-[32px] sm:px-6 sm:pt-4"
      >
        <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-border/80" />
        {step === "choose" ? (
          <>
            <header className="flex items-start justify-between gap-3 py-5">
              <div>
                <h2
                  id="add-meal-drawer-title"
                  className="font-display text-[29px] leading-[1.08] font-extrabold tracking-tight"
                >
                  Add a meal
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                  Take a photo or choose one from your gallery.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close add meal"
                onClick={close}
                className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
              >
                <X className="size-[19px]" strokeWidth={1.9} />
              </button>
            </header>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="surface-card press enter-card flex min-h-[170px] flex-col items-center justify-center gap-3 p-5 text-center"
              >
                <img
                  src="/illustrations/capture-photo.png"
                  alt=""
                  className="size-24 object-contain"
                />
                <span>
                  <span className="block text-[17px] font-bold">Take a photo</span>
                  <span className="mt-1 block text-[13.5px] text-muted-foreground">
                    Use your camera.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="surface-card press enter-card flex min-h-[170px] flex-col items-center justify-center gap-3 p-5 text-center"
              >
                <img
                  src="/illustrations/upload-gallery.png"
                  alt=""
                  className="size-24 object-contain"
                />
                <span>
                  <span className="block text-[17px] font-bold">Choose from gallery</span>
                  <span className="mt-1 block text-[13.5px] text-muted-foreground">
                    Pick a saved photo.
                  </span>
                </span>
              </button>
            </div>
            <p className="mt-6 pb-2 text-center text-[13.5px] text-subtle">
              We save the date and time for you — just add a name if you feel like it.
            </p>
          </>
        ) : null}

        {step === "processing" ? (
          <div className="enter-card flex flex-col items-center px-6 py-24 text-center">
            <div className="relative">
              <span aria-hidden className="absolute inset-6 rounded-full bg-sunny-soft blur-2xl" />
              <img
                src="/illustrations/empty-meals.png"
                alt=""
                className="pop-in relative h-40 w-auto object-contain"
              />
            </div>
            <h2 className="mt-8 text-[22px] font-bold">Making your meal look nice…</h2>
            <p
              className="mt-2 flex max-w-xs items-center gap-2 text-[14.5px] text-muted-foreground"
              aria-live="polite"
            >
              <Loader2 className="size-4 animate-spin text-accent" strokeWidth={2} />
              {PROCESSING_PHASES[phase]}
            </p>
          </div>
        ) : null}

        {step === "edit" && photo ? (
          <div className="space-y-6">
            <header className="flex items-start justify-between gap-3 py-5">
              <div>
                <h2
                  id="add-meal-drawer-title"
                  className="font-display text-[29px] leading-[1.08] font-extrabold tracking-tight"
                >
                  Looks good?
                </h2>
                <p className="mt-2 text-[15px] leading-6 text-muted-foreground">
                  Add a few details, then save this memory.
                </p>
              </div>
              <button
                type="button"
                aria-label="Discard photo"
                onClick={() => {
                  setPhoto(null);
                  setStep("choose");
                }}
                className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
              >
                <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
              </button>
            </header>
            <section className="surface-card flex flex-col items-center p-5">
              <FoodSticker
                src={useOriginal ? photo.original : photo.processed}
                alt="Meal preview"
                className="size-52"
                rounded="rounded-[32px]"
              />
              {!photo.cutout ? (
                <p className="mt-4 flex items-center gap-2 text-[13.5px] text-muted-foreground">
                  <TriangleAlert className="size-4 shrink-0 text-accent" strokeWidth={2} />
                  We couldn't create a cutout, but your meal is still ready to save.
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="press inline-flex h-11 items-center gap-2 rounded-full bg-muted px-4 text-[13.5px] font-semibold text-muted-foreground"
                >
                  <RefreshCw className="size-4" strokeWidth={2} />
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={() => setUseOriginal(!useOriginal)}
                  aria-pressed={useOriginal}
                  className={cn(
                    "press inline-flex h-11 items-center rounded-full px-4 text-[13.5px] font-semibold",
                    useOriginal
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  Use original photo
                </button>
              </div>
            </section>
            <section className="surface-card space-y-5 p-5">
              <MealForm values={values} onChange={setValues} />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="primary-button press flex h-14 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold text-accent-foreground disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-5 animate-spin" strokeWidth={2.2} /> : null}Save
                memory
              </button>
            </section>
          </div>
        ) : null}

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </section>
    </div>
  );
}
