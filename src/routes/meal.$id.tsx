import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, CalendarDays, Loader2, MapPin, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Page, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { FoodSticker } from "@/components/food-sticker";
import { PageLoadingState } from "@/components/loading-state";
import { MealForm, mealToForm, type MealFormValues } from "@/components/meal-form";
import { processPhoto } from "@/lib/image";
import {
  MEAL_TYPES,
  formatDateLabel,
  formatTimeLabel,
  mealImage,
  useMeals,
  type Meal,
} from "@/lib/meals";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/meal/$id")({
  head: () => ({
    meta: [
      { title: "Meal — Nomory" },
      { name: "description", content: "A saved meal in your Nomory food diary." },
      { property: "og:title", content: "Meal — Nomory" },
      {
        property: "og:description",
        content: "A saved meal in your visual food diary.",
      },
    ],
  }),
  component: MealDetailPage,
});

function MealDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { ready, getMeal, saveMeal, removeMeal } = useMeals();
  const meal = getMeal(id);

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<MealFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!ready) {
    return (
      <AppShell>
        <Page>
          <PageLoadingState label="Loading your meal…" rows={1} />
        </Page>
      </AppShell>
    );
  }

  if (!meal) {
    return (
      <AppShell>
        <Page>
          <PageHeader title="Meal" />
          <EmptyState
            title="Meal not found"
            description="This memory may have been deleted or isn’t available on this device."
            cta="Back to today"
            to="/"
          />
        </Page>
      </AppShell>
    );
  }

  const typeLabel = MEAL_TYPES.find((t) => t.value === meal.mealType)?.label ?? "Meal";
  const hasBothPhotos = meal.originalImage !== meal.processedImage;

  const startEdit = () => {
    setValues(mealToForm(meal));
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!meal || !values) return;
    setSaving(true);
    try {
      const updated: Meal = {
        ...meal,
        mealName: values.mealName.trim(),
        mealType: values.mealType,
        mealDate: values.mealDate,
        mealTime: values.mealTime,
        note: values.note.trim(),
        location: values.location.trim(),
        updatedAt: Date.now(),
      };
      await saveMeal(updated);
      setEditing(false);
      toast.success("Memory updated");
    } catch {
      toast.error("Couldn't save changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const togglePhoto = async () => {
    if (!meal) return;
    await saveMeal({ ...meal, useOriginal: !meal.useOriginal, updatedAt: Date.now() });
  };

  const changePhoto = async (file: File | undefined) => {
    if (!meal || !file) return;
    setReplacing(true);
    try {
      const photo = await processPhoto(file);
      await saveMeal({
        ...meal,
        originalImage: photo.original,
        processedImage: photo.processed,
        useOriginal: false,
        updatedAt: Date.now(),
      });
      toast.success("Photo updated");
    } catch {
      toast.error("Couldn't upload this photo. Try again.");
    } finally {
      setReplacing(false);
    }
  };

  const destroy = async () => {
    if (!meal) return;
    try {
      await removeMeal(meal.id);
      toast.success("Memory deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Couldn’t delete this memory. Try again.");
    }
  };

  if (editing && values) {
    return (
      <AppShell>
        <Page>
          <PageHeader
            title="Edit memory"
            subtitle="Update the details you want to remember."
            right={
              <button
                type="button"
                aria-label="Cancel editing"
                onClick={() => setEditing(false)}
                className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
              >
                <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
              </button>
            }
          />
          <div className="space-y-5">
            <MealForm values={values} onChange={setValues} />
            <button
              type="button"
              onClick={saveEdit}
              disabled={saving}
              className="press flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent text-[16px] font-semibold text-accent-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-5 animate-spin" strokeWidth={2.2} /> : null}
              Save changes
            </button>
          </div>
        </Page>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Page>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            changePhoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <PageHeader
          title={meal.mealName || typeLabel}
          subtitle={`${formatDateLabel(meal.mealDate)} · ${formatTimeLabel(meal.mealTime)}`}
          right={
            <button
              type="button"
              aria-label="Back"
              onClick={() => navigate({ to: "/calendar" })}
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
            </button>
          }
        />

        <section className="surface-card enter-card flex flex-col items-center p-6">
          <div className="relative">
            <FoodSticker
              src={mealImage(meal)}
              alt={meal.mealName || "Saved meal"}
              className={cn("size-48 sm:size-56", replacing && "opacity-50")}
              rounded="rounded-[36px]"
            />
            {replacing ? (
              <span className="absolute inset-0 grid place-items-center">
                <Loader2 className="size-8 animate-spin text-accent" strokeWidth={2} />
              </span>
            ) : null}
          </div>

          <span className="mt-5 rounded-full bg-accent-soft px-4 py-1.5 text-[13px] font-semibold text-accent">
            {typeLabel}
          </span>

          {hasBothPhotos ? (
            <button
              type="button"
              onClick={togglePhoto}
              className="press mt-4 text-[13.5px] font-semibold text-muted-foreground underline underline-offset-4"
            >
              {meal.useOriginal ? "View food sticker" : "View original photo"}
            </button>
          ) : null}
        </section>

        {meal.note ? (
          <section className="surface-card mt-4 p-5">
            <p className="mb-2 text-[13px] font-semibold text-muted-foreground">Note</p>
            <p className="text-[15px] leading-[1.5]">{meal.note}</p>
          </section>
        ) : null}

        {meal.location ? (
          <section className="surface-card mt-4 flex items-center gap-3 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <MapPin className="size-[18px]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-muted-foreground">Location</p>
              <p className="mt-1 truncate text-[15px]">{meal.location}</p>
            </div>
          </section>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={startEdit}
            className="surface-card press flex h-14 items-center justify-center gap-2 rounded-[20px] text-[15px] font-semibold"
          >
            <Pencil className="size-[18px] text-accent" strokeWidth={1.9} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={replacing}
            className="surface-card press flex h-14 items-center justify-center gap-2 rounded-[20px] text-[15px] font-semibold disabled:opacity-60"
          >
            <RefreshCw className="size-[18px] text-accent" strokeWidth={1.9} />
            Change photo
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="surface-card press flex h-14 items-center justify-center gap-2 rounded-[20px] text-[15px] font-semibold text-destructive"
          >
            <Trash2 className="size-[18px]" strokeWidth={1.9} />
            Delete memory
          </button>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[13px] text-subtle">
          <CalendarDays className="size-4" strokeWidth={1.9} />
          Saved {formatDateLabel(meal.mealDate)} at {formatTimeLabel(meal.mealTime)}
        </p>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent className="w-[calc(100%-2rem)] rounded-[26px] border-border bg-background p-5 sm:p-6">
            <AlertDialogHeader className="text-left">
              <img
                src="/illustrations/toast-error.png"
                alt=""
                className="mb-1 size-14 object-contain"
              />
              <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
              <AlertDialogDescription>
                “{meal.mealName || typeLabel}” will be removed from your diary. This action can’t be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2 gap-2 sm:gap-2">
              <AlertDialogCancel className="mt-0 rounded-full">Keep memory</AlertDialogCancel>
              <AlertDialogAction
                onClick={destroy}
                className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete memory
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Page>
    </AppShell>
  );
}
