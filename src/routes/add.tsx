import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, ImagePlus, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { FoodSticker } from "@/components/food-sticker";
import { MealForm, type MealFormValues } from "@/components/meal-form";
import { processPhoto } from "@/lib/image";
import { suggestMealType, toDateKey, toTimeKey, useMeals, type Meal } from "@/lib/meals";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add a meal | Morsel" },
      {
        name: "description",
        content: "Take a photo of your meal or upload one from your gallery.",
      },
      { property: "og:title", content: "Add a meal" },
      {
        property: "og:description",
        content: "Take a photo of your meal or upload one from your gallery.",
      },
    ],
  }),
  component: AddMealPage,
});

type Step = "choose" | "processing" | "edit";

const PROCESSING_PHASES = ["Finding your food.", "Cleaning up the photo.", "Almost ready."];

type Photo = {
  original: string;
  processed: string;
  cutout: boolean;
};

function freshValues(): MealFormValues {
  const now = new Date();
  return {
    mealName: "",
    mealType: suggestMealType(toTimeKey(now)),
    mealDate: toDateKey(now),
    mealTime: toTimeKey(now),
    note: "",
    tags: [],
  };
}

function AddMealPage() {
  const navigate = useNavigate();
  const { saveMeal } = useMeals();
  const [step, setStep] = useState<Step>("choose");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [useOriginal, setUseOriginal] = useState(false);
  const [values, setValues] = useState<MealFormValues>(freshValues);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step !== "processing") return;
    setPhase(0);
    const timer = setInterval(() => setPhase((p) => (p + 1) % PROCESSING_PHASES.length), 900);
    return () => clearInterval(timer);
  }, [step]);

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
      toast.error("Couldn't upload this photo. Try again.");
      setStep("choose");
    }
  };

  const reset = () => {
    setPhoto(null);
    setStep("choose");
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
        useOriginal,
        mealName: values.mealName.trim(),
        mealType: values.mealType,
        note: values.note.trim(),
        tags: values.tags,
        mealDate: values.mealDate,
        mealTime: values.mealTime,
        createdAt: now,
        updatedAt: now,
      };
      await saveMeal(meal);
      toast.success(values.mealName ? `“${values.mealName}” saved!` : "Meal saved!");
      navigate({ to: "/" });
    } catch {
      toast.error("Couldn't save this meal. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <Page>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {step === "choose" ? (
          <>
            <PageHeader
              title="Add a meal"
              subtitle="Take a photo or upload one from your gallery."
              right={
                <button
                  type="button"
                  aria-label="Back to today"
                  onClick={() => navigate({ to: "/" })}
                  className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
                >
                  <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
                </button>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="surface-card press enter-card flex flex-col items-start gap-4 p-6 text-left"
              >
                <span className="grid size-14 place-items-center rounded-[20px] bg-accent-soft">
                  <Camera className="size-6 text-accent" strokeWidth={1.9} />
                </span>
                <span>
                  <span className="block text-[18px] font-bold">Take a photo</span>
                  <span className="mt-1 block text-[14.5px] text-muted-foreground">
                    Snap your plate right now.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="surface-card press enter-card flex flex-col items-start gap-4 p-6 text-left"
              >
                <span className="grid size-14 place-items-center rounded-[20px] bg-accent-soft">
                  <ImagePlus className="size-6 text-accent" strokeWidth={1.9} />
                </span>
                <span>
                  <span className="block text-[18px] font-bold">Upload photo</span>
                  <span className="mt-1 block text-[14.5px] text-muted-foreground">
                    Pick one from your gallery.
                  </span>
                </span>
              </button>
            </div>

            <p className="mt-6 text-center text-[13.5px] text-subtle">
              We save the date and time for you — just add a name if you feel like it.
            </p>
          </>
        ) : null}

        {step === "processing" ? (
          <div className="enter-card flex flex-col items-center px-6 py-24 text-center">
            <span className="pop-in grid size-28 place-items-center rounded-[36px] bg-accent-soft">
              <Loader2 className="size-9 animate-spin text-accent" strokeWidth={1.9} />
            </span>
            <h2 className="mt-8 text-[22px] font-bold">Making your meal look nice…</h2>
            <p className="mt-2 max-w-xs text-[14.5px] text-muted-foreground">
              {PROCESSING_PHASES[phase]}
            </p>
          </div>
        ) : null}

        {step === "edit" && photo ? (
          <div className="space-y-8">
            <PageHeader
              title="Looks good?"
              subtitle="Add a few details and save this memory."
              right={
                <button
                  type="button"
                  aria-label="Discard photo"
                  onClick={reset}
                  className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
                >
                  <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
                </button>
              }
            />

            <section className="surface-card enter-card flex flex-col items-center p-6">
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

            <section className="space-y-5">
              <MealForm values={values} onChange={setValues} />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="press flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-[16px] font-semibold text-accent-foreground disabled:opacity-60"
              >
                {saving ? <Loader2 className="size-5 animate-spin" strokeWidth={2.2} /> : null}
                Save meal
              </button>
            </section>
          </div>
        ) : null}
      </Page>
    </AppShell>
  );
}
