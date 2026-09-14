import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { FeedbackKind } from "@/lib/feedback";

type FeedbackState = {
  kind: FeedbackKind;
  message: string;
  title?: string;
  eyebrow?: string;
} | null;

const feedbackCopy: Record<FeedbackKind, { eyebrow: string; title: string; image: string }> = {
  success: {
    eyebrow: "All set",
    title: "Saved to your memories",
    image: "/illustrations/toast-success.png",
  },
  error: {
    eyebrow: "Something went wrong",
    title: "We couldn’t complete that",
    image: "/illustrations/toast-error.png",
  },
  warning: {
    eyebrow: "A quick heads-up",
    title: "Take another look",
    image: "/illustrations/toast-warning.png",
  },
  info: {
    eyebrow: "Nomory note",
    title: "Here’s what happened",
    image: "/illustrations/toast-warning.png",
  },
};

export function FeedbackModal() {
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const okayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onFeedback = (event: Event) => {
      const detail = (event as CustomEvent<NonNullable<FeedbackState>>).detail;
      setFeedback(detail);
    };
    window.addEventListener("nomory:feedback", onFeedback);
    return () => window.removeEventListener("nomory:feedback", onFeedback);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    okayRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFeedback(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback]);

  if (!feedback) return null;
  const copy = feedbackCopy[feedback.kind];

  return (
    <div
      className="modal-backdrop-in fixed inset-0 z-[100] flex items-end justify-center bg-foreground/18 p-0 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setFeedback(null);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        aria-describedby="feedback-message"
        className={`feedback-modal sheet-in relative w-full max-w-[430px] overflow-hidden rounded-t-[32px] bg-card px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-9 text-center shadow-[0_-16px_50px_oklch(0.32_0.05_55/0.18)] ${feedback.kind}`}
      >
        <div aria-hidden className="feedback-gradient absolute inset-x-0 top-0 h-32 opacity-90" />
        <button
          type="button"
          aria-label="Close message"
          onClick={() => setFeedback(null)}
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-card/80 text-muted-foreground shadow-[var(--shadow-pill)] backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <X className="size-5" strokeWidth={2} />
        </button>
        <span aria-hidden className="relative mx-auto mb-2 block h-1 w-10 rounded-full bg-border" />
        <div className="relative mx-auto grid size-24 place-items-center">
          <img src={copy.image} alt="" className="size-24 object-contain" />
        </div>
        <p className="relative mt-3 text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          {feedback.eyebrow ?? copy.eyebrow}
        </p>
        <h2
          id="feedback-title"
          className="relative mt-2 font-display text-[25px] font-extrabold tracking-tight"
        >
          {feedback.title ?? copy.title}
        </h2>
        <p
          id="feedback-message"
          className="relative mx-auto mt-3 max-w-sm text-[15px] leading-6 text-muted-foreground"
        >
          {feedback.message}
        </p>
        <button
          ref={okayRef}
          type="button"
          onClick={() => setFeedback(null)}
          className="press relative mt-7 h-14 w-full rounded-full bg-foreground px-6 text-[15px] font-bold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Okay
        </button>
      </section>
    </div>
  );
}
