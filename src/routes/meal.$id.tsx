import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "@/lib/feedback";
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
  mealImageFallback,
  useMeals,
  type Meal,
} from "@/lib/meals";
import { cn } from "@/lib/utils";

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
        price: Number(values.price) || 0,
        rating: values.rating,
        updatedAt: Date.now(),
      };
      await saveMeal(updated);
      setEditing(false);
      toast.success("Your changes are saved.", { title: "Memory updated" });
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
        thumbnailImage: photo.thumbnail,
        useOriginal: false,
        updatedAt: Date.now(),
      });
      toast.success("Your new photo is ready to view.", { title: "Photo updated" });
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
      toast.success("This meal is no longer in your diary.", { title: "Memory removed" });
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
            left={
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
              className="primary-button press flex h-14 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold text-accent-foreground disabled:opacity-60"
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
            subtitle={typeLabel}
          left={
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
              fallbackSrc={mealImageFallback(meal)}
              alt={meal.mealName || "Saved meal"}
              className={cn("size-48", replacing && "opacity-50")}
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

        <section className="surface-card mt-4 p-5" aria-label="Meal details">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <DetailItem label="Date" value={formatDateLabel(meal.mealDate)} />
            <DetailItem label="Time" value={formatTimeLabel(meal.mealTime)} />
            <DetailItem label="Price" value={meal.price ? formatPrice(meal.price) : "—"} />
            <div>
              <p className="text-[13px] font-semibold text-muted-foreground">Rating</p>
              <div className="mt-1 flex items-center gap-0.5 text-sunny" aria-label={meal.rating ? `${meal.rating} out of 5 stars` : "Not rated"}>
                {meal.rating ? (
                  Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className="size-4"
                      fill={index < meal.rating ? "currentColor" : "none"}
                      strokeWidth={1.8}
                    />
                  ))
                ) : (
                  <span className="text-[15px] text-subtle">—</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card mt-4 p-5">
          <p className="mb-2 text-[13px] font-semibold text-muted-foreground">Note</p>
          <p className={cn("text-[15px] leading-[1.5]", !meal.note && "text-subtle")}>{meal.note || "No note added"}</p>
        </section>

        <section className="surface-card mt-4 flex items-center gap-3 p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <MapPin className="size-[18px]" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-muted-foreground">Location</p>
            <p className={cn("mt-1 truncate text-[15px]", !meal.location && "text-subtle")}>
              {meal.location || "No location added"}
            </p>
          </div>
        </section>

        <div className="mt-4 grid gap-2">
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

        <DeleteMemoryModal
          open={deleteOpen}
          mealName={meal.mealName || typeLabel}
          onClose={() => setDeleteOpen(false)}
          onConfirm={destroy}
        />
      </Page>
    </AppShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-[15px]">{value}</p>
    </div>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function DeleteMemoryModal({
  open,
  mealName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  mealName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, deleting, onClose]);

  if (!open) return null;

  const confirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-memory-title"
        aria-describedby="delete-memory-description"
        className="delete-modal relative w-full max-w-[430px] overflow-hidden rounded-t-[32px] bg-card px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-9 text-center shadow-[0_-16px_50px_oklch(0.32_0.05_55/0.18)]"
      >
        <div aria-hidden className="delete-gradient absolute inset-x-0 top-0 h-32 opacity-90" />
        <button
          type="button"
          aria-label="Close delete confirmation"
          onClick={onClose}
          disabled={deleting}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-card/80 text-muted-foreground shadow-[var(--shadow-pill)] backdrop-blur focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
        >
          <X className="size-5" />
        </button>
        <span aria-hidden className="relative mx-auto mb-2 block h-1 w-10 rounded-full bg-border" />
        <div className="relative mx-auto grid size-24 place-items-center">
          <img src="/illustrations/toast-warning.png" alt="" className="size-24 object-contain" />
        </div>
        <p className="relative mt-3 text-[11px] font-bold tracking-[0.16em] text-destructive uppercase">
          Careful
        </p>
        <h2
          id="delete-memory-title"
          className="relative mt-2 font-display text-[25px] font-extrabold tracking-tight"
        >
          Delete this memory?
        </h2>
        <p
          id="delete-memory-description"
          className="relative mx-auto mt-3 max-w-sm text-[15px] leading-6 text-muted-foreground"
        >
          “{mealName}” will be removed from your diary. This can&apos;t be undone.
        </p>
        <div className="relative mt-7 grid gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="press h-14 rounded-full border border-border bg-background text-[15px] font-bold text-foreground focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
          >
            Keep memory
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={confirm}
            disabled={deleting}
            className="press h-14 rounded-full bg-destructive text-[15px] font-bold text-destructive-foreground focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete memory"}
          </button>
        </div>
      </section>
    </div>
  );
}
