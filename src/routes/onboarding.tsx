import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Camera, Images } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to Morsel — Your visual food diary" },
      {
        name: "description",
        content: "Save meals with a quick photo and watch your food memories grow.",
      },
      { property: "og:title", content: "Welcome to Morsel" },
      {
        property: "og:description",
        content: "Save meals with a quick photo and watch your food memories grow.",
      },
    ],
  }),
  component: Onboarding,
});

const steps = [
  {
    icon: Camera,
    title: "Remember what you ate.",
    body: "Save meals with a quick photo and build your own visual food diary.",
  },
  {
    icon: CalendarDays,
    title: "Your meals, automatically organized.",
    body: "Every photo is saved by date and time so you can revisit it later.",
  },
  {
    icon: Images,
    title: "See your food memories grow.",
    body: "Browse your meals by day, month, or memory.",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const step = steps[index]!;
  const Icon = step.icon;
  const last = index === steps.length - 1;

  const finish = () => {
    localStorage.setItem("morsel.onboarded", "1");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col px-6 pt-16 pb-10">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <span className="pop-in grid size-20 place-items-center rounded-[28px] bg-accent-soft">
          <Icon className="size-9 text-accent" strokeWidth={1.8} />
        </span>
        <h1 className="mt-10 text-[34px] leading-[1.08] font-bold">{step.title}</h1>
        <p className="mt-4 text-[16px] leading-[1.45] text-muted-foreground">{step.body}</p>

        <div className="mt-10 flex gap-2">
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
