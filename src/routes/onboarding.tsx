import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Camera, Images } from "lucide-react";
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
    icon: Camera,
    pill: "Capture",
    pillClass: "bg-blush-soft text-[#c2437b]",
    title: "Capture what you eat.",
    body: "Save meals with a quick photo and build your own visual food diary.",
  },
  {
    icon: CalendarDays,
    pill: "Remember",
    pillClass: "bg-sunny-soft text-[#8a6100]",
    title: "Remember, automatically.",
    body: "Every photo is saved by date and time so you can revisit it later.",
  },
  {
    icon: Images,
    pill: "Look Back",
    pillClass: "bg-sky-soft text-sky",
    title: "Look back on big memories.",
    body: "Browse little bites by day, month, or craving. Good food, brighter days.",
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
  const Icon = step.icon;
  const last = index === steps.length - 1;

  const finish = () => {
    localStorage.setItem("nomory.onboarded", "1");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pt-16 pb-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <NomoryLogo className="text-[38px]" />
        <div className="relative mt-7 overflow-hidden rounded-[32px] bg-card px-5 pt-5 shadow-[var(--shadow-card)]">
          <span aria-hidden className="absolute -top-8 -right-8 size-32 rounded-full bg-blush-soft blur-2xl" />
          <img src="/illustrations/empty-meals.png" alt="" className="relative mx-auto h-44 w-auto object-contain" />
        </div>
        <span className="pop-in mt-6 inline-flex w-fit items-center gap-2 rounded-full text-[13px] font-bold">
          <span className={cn("rounded-full px-3 py-1", step.pillClass)}>{step.pill}</span>
        </span>
        <span className="pop-in mt-4 flex w-fit items-center gap-2 rounded-full bg-accent-soft px-4 py-2 text-[14px] font-semibold text-accent">
          <Icon className="size-4" strokeWidth={2} />
          Step {index + 1} of {steps.length}
        </span>
        <h1 className="font-display mt-5 text-[34px] leading-[1.05] font-extrabold tracking-tight">
          {step.title}
        </h1>
        <p className="mt-4 text-[16px] leading-[1.45] text-muted-foreground">{step.body}</p>

        <div className="mt-7 flex gap-2">
          {steps.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-8 bg-accent" : "w-3 bg-border",
              )}
            />
          ))}
        </div>

        <div className="mt-auto space-y-3 pt-12">
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
