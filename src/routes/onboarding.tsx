import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getAuthStatus } from "@/lib/auth";
import { completeGoogleUsername } from "@/lib/auth";
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
    image: "/illustrations/onboarding/capture-mascot-optimized.png",
    imageAlt: "Nomory tomato mascot holding a meal memory",
    title: "A photo is all it takes.",
    body: "Snap a meal in the moment. No calorie counting, no long forms—just your food diary, starting with a bite.",
    detail: "Photo first · zero pressure",
  },
  {
    pill: "Remember",
    pillClass: "bg-sunny-soft text-[#8a6100]",
    image: "/illustrations/onboarding/remember-mascots-optimized.png",
    imageAlt: "Nomory toast and clover mascots arranging memory cards",
    title: "Remember without trying.",
    body: "Each meal finds its place by date and time, so the little things are there whenever you want them.",
    detail: "Saved by day · easy to find",
  },
  {
    pill: "Look Back",
    pillClass: "bg-sky-soft text-sky",
    image: "/illustrations/onboarding/lookback-mascot-optimized.png",
    imageAlt: "Nomory flower mascot looking at a collage of meal memories",
    title: "Little bites. Brighter days.",
    body: "Look back by day, month, or craving—and notice the food moments that made your days feel good.",
    detail: "Your visual diary · yours to keep",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
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
  const needsUsername = auth.user.provider === "google" && !auth.user.username;
  const saveUsername = async (event: React.FormEvent) => {
    event.preventDefault();
    setUsernameError(null);
    setSavingUsername(true);
    try {
      const result = await completeGoogleUsername({ data: { username } });
      if (!result.ok) {
        setUsernameError(result.error ?? "Username belum bisa disimpan.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
    } catch {
      setUsernameError("Username belum bisa disimpan. Coba lagi.");
    } finally {
      setSavingUsername(false);
    }
  };
  const finish = () => {
    localStorage.setItem("nomory.onboarded", "1");
    navigate({ to: "/" });
  };

  return (
    <div className="onboarding-page mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {needsUsername ? (
          <form onSubmit={saveUsername} className="flex flex-1 flex-col justify-center">
            <NomoryLogo className="text-[35px]" />
            <p className="section-label mt-12">One last thing</p>
            <h1 className="font-display mt-2 text-[34px] leading-[1.04] font-extrabold tracking-tight">
              Choose your username.
            </h1>
            <p className="mt-4 text-[16px] leading-[1.5] text-muted-foreground">
              This is how your Nomory diary will appear on every device.
            </p>
            <label className="mt-8 block text-[14px] font-semibold">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your_nomory"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={20}
                className="input-soft mt-2 h-13 px-4 font-normal"
              />
            </label>
            {usernameError ? <p className="mt-3 text-[13px] font-medium text-destructive">{usernameError}</p> : null}
            <button
              type="submit"
              disabled={!username.trim() || savingUsername}
              className="primary-button press mt-6 h-14 w-full rounded-full text-[16px] font-semibold text-accent-foreground disabled:opacity-50"
            >
              {savingUsername ? "Saving…" : "Continue"}
            </button>
          </form>
        ) : (
          <>
        <div className="flex items-center justify-between gap-4">
          <NomoryLogo className="text-[35px]" />
        </div>

        <div key={step.pill} className="onboarding-step flex flex-1 flex-col">
          <div className="relative mt-8 grid min-h-[250px] place-items-center px-4">
            <img
              src={step.image}
              alt={step.imageAlt}
              className="onboarding-illustration max-h-[235px] w-auto max-w-[94%] object-contain"
            />
          </div>
          <span className="mt-6 inline-flex w-fit text-[13px] font-bold">
            <span className={cn("rounded-full px-3 py-1.5", step.pillClass)}>{step.pill}</span>
          </span>
          <p className="onboarding-copy mt-5 text-[13px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
            {step.detail}
          </p>
          <h1 className="onboarding-copy font-display mt-2 text-balance text-[34px] leading-[1.04] font-extrabold tracking-tight">
            {step.title}
          </h1>
          <p className="onboarding-copy mt-4 max-w-[34rem] text-[16px] leading-[1.5] text-muted-foreground">
            {step.body}
          </p>
        </div>

        <div
          className="mt-6 flex items-center gap-2"
          aria-label={`Onboarding step ${index + 1} of ${steps.length}`}
        >
          {steps.map((item, itemIndex) => (
            <span
              key={item.title}
              aria-hidden="true"
              className={cn(
                "rounded-full transition-all",
                itemIndex === index ? "size-2.5 bg-accent" : "size-2 bg-border",
              )}
            />
          ))}
        </div>

        <div className="mt-auto space-y-2 pt-7">
          <button
            type="button"
            onClick={() => (last ? finish() : setIndex(index + 1))}
            className="primary-button press h-14 w-full rounded-full text-[16px] font-semibold text-accent-foreground"
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
          </>
        )}
      </div>
    </div>
  );
}
