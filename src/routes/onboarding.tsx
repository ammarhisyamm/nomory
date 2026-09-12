import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getAuthStatus } from "@/lib/auth";
import { NomoryLogo, NomoryMark } from "@/components/nomory-logo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to Nomory — Your meals, remembered" },
      {
        name: "description",
        content: "Nomory helps you remember what you eat, one photo at a time.",
      },
      { property: "og:title", content: "Welcome to Nomory" },
      {
        property: "og:description",
        content: "Capture meals. Remember what you ate. Look back anytime.",
      },
    ],
  }),
  component: Onboarding,
});

const steps = [
  {
    pill: "Capture",
    pillClass: "bg-blush-soft text-[#c2437b]",
    image: "/illustrations/onboarding/capture-mascot-optimized.gif",
    imageAlt: "Nomory tomato mascot holding a meal memory",
    visualClass: "onboarding-visual-capture",
    title: "A photo is all it takes.",
    body: "Snap a meal in the moment. No calorie counting, no long forms—just your food diary, starting with a bite.",
    detail: "Photo first · zero pressure",
  },
  {
    pill: "Remember",
    pillClass: "bg-sunny-soft text-[#8a6100]",
    image: "/illustrations/onboarding/remember-mascots-optimized.png",
    imageAlt: "Nomory toast and clover mascots arranging memory cards",
    visualClass: "onboarding-visual-remember",
    title: "Remember without trying.",
    body: "Each meal finds its place by date and time, so the little things are there whenever you want them.",
    detail: "Saved by day · easy to find",
  },
  {
    pill: "Look Back",
    pillClass: "bg-sky-soft text-sky",
    image: "/illustrations/onboarding/lookback-mascot-optimized.png",
    imageAlt: "Nomory flower mascot looking at a collage of meal memories",
    visualClass: "onboarding-visual-lookback",
    title: "Little bites. Brighter days.",
    body: "Look back by day, month, or craving—and notice the food moments that made your days feel good.",
    detail: "Your visual diary · yours to keep",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const { data: auth } = useQuery({ queryKey: ["auth"], queryFn: getAuthStatus });

  useEffect(() => {
    if (auth && !auth.user) navigate({ to: "/login" });
  }, [auth, navigate]);

  if (!auth?.user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <NomoryMark className="size-20 animate-pulse text-[64px]" />
      </div>
    );
  }

  const step = steps[index]!;
  const last = index === steps.length - 1;
  const finish = () => {
    localStorage.setItem("nomory.onboarded", "1");
    navigate({ to: "/" });
  };

  return (
    <div className="onboarding-page flex min-h-[100dvh] flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-12 sm:pb-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <NomoryLogo className="text-[35px] sm:text-[38px]" />
          <span className="rounded-full bg-card px-3 py-1.5 text-[12px] font-bold text-muted-foreground shadow-[var(--shadow-pill)]">
            {index + 1} / {steps.length}
          </span>
        </div>

        <div key={step.pill} className="onboarding-step flex flex-1 flex-col">
          <div className="relative mt-6 grid min-h-[270px] place-items-center overflow-hidden rounded-[32px] border border-white/80 bg-card px-4 py-5 shadow-[var(--shadow-card)] sm:min-h-[310px]">
            <span
              aria-hidden
              className="absolute -top-12 -right-10 size-36 rounded-full bg-blush-soft/80 blur-2xl"
            />
            <span
              aria-hidden
              className="absolute -bottom-14 -left-12 size-40 rounded-full bg-sunny-soft/70 blur-2xl"
            />
            <span
              aria-hidden
              className="onboarding-orbit absolute top-8 right-8 size-3 rounded-full bg-sunny"
            />
            <picture className={cn("relative z-10 block", step.visualClass)}>
              {index === 0 ? (
                <source
                  media="(prefers-reduced-motion: reduce)"
                  srcSet="/illustrations/onboarding/capture-mascot-optimized.png"
                />
              ) : null}
              <img
                src={step.image}
                alt={step.imageAlt}
                className="max-h-[245px] w-auto max-w-[94%] object-contain sm:max-h-[282px]"
              />
            </picture>
          </div>
          <span className="mt-6 inline-flex w-fit text-[13px] font-bold">
            <span className={cn("rounded-full px-3 py-1.5", step.pillClass)}>{step.pill}</span>
          </span>
          <p className="onboarding-copy mt-5 text-[13px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
            {step.detail}
          </p>
          <h1 className="onboarding-copy font-display mt-2 text-balance text-[34px] leading-[1.04] font-extrabold tracking-tight sm:text-[38px]">
            {step.title}
          </h1>
          <p className="onboarding-copy mt-4 max-w-[34rem] text-[16px] leading-[1.5] text-muted-foreground">
            {step.body}
          </p>
        </div>

        <div
          className="mt-6 flex gap-2"
          aria-label={`Onboarding step ${index + 1} of ${steps.length}`}
        >
          {steps.map((item, itemIndex) => (
            <span
              key={item.title}
              className={cn(
                "h-1.5 rounded-full transition-all",
                itemIndex === index ? "w-8 bg-accent" : "w-3 bg-border",
              )}
            />
          ))}
        </div>

        <div className="mt-auto space-y-2 pt-7 sm:pt-9">
          <button
            type="button"
            onClick={() => (last ? finish() : setIndex(index + 1))}
            className="press h-14 w-full rounded-full bg-accent text-[16px] font-semibold text-accent-foreground"
          >
            {last ? "Start my food diary" : "Continue"}
          </button>
          {!last ? (
            <button
              type="button"
              onClick={finish}
              className="press h-12 w-full rounded-full text-[15px] font-medium text-muted-foreground"
            >
              Skip
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
