import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  Heart,
  MapPin,
  NotebookPen,
  Plus,
} from "lucide-react";
import { FoodSticker } from "@/components/food-sticker";
import { NomoryLogo } from "@/components/nomory-logo";
import { MEAL_TYPES, type MealType } from "@/lib/meals";
import "@/website.css";

export const Route = createFileRoute("/website")({
  head: () => ({
    meta: [
      { title: "Nomory | Your meals, remembered" },
      {
        name: "description",
        content: "A visual food diary for the meals, places, and little details worth remembering.",
      },
      { property: "og:title", content: "Nomory | Your meals, remembered" },
      {
        property: "og:description",
        content: "Capture a meal. Keep the moment. Come back to it anytime.",
      },
    ],
  }),
  component: WebsiteLandingPage,
});

const features = [
  {
    title: "Capture a meal",
    description: "Take a photo now or choose one from your gallery.",
    icon: Camera,
    preview: "photo",
    className: "website-feature-capture",
  },
  {
    title: "Keep the details",
    description: "Add a note, rating, menu, price, or location when it matters.",
    icon: NotebookPen,
    preview: "details",
    className: "website-feature-details",
  },
  {
    title: "Find it again",
    description: "Find every meal by day, place, or the details you remember.",
    icon: BookOpen,
    preview: "calendar",
    className: "website-feature-calendar",
  },
] as const;

const steps = [
  {
    title: "Capture",
    description: "Take a photo or choose one from your gallery.",
    icon: Camera,
    preview: "capture",
  },
  {
    title: "Save",
    description: "Add only the details you want to keep.",
    icon: NotebookPen,
    preview: "save",
  },
  {
    title: "Remember",
    description: "Your meal joins your diary, ready to revisit.",
    icon: BookOpen,
    preview: "remember",
  },
] as const;

const questions = [
  {
    question: "Do I need to fill in every detail?",
    answer:
      "No. A photo is enough. Add a rating, note, menu, price, or location only when it helps you remember.",
  },
  {
    question: "Where do my saved meals go?",
    answer:
      "Your meals appear in Memories and Calendar, organized by date so you can find them again.",
  },
  {
    question: "Can I use Nomory on my phone and computer?",
    answer: "Yes. Sign in to the same account and your diary stays with you across devices.",
  },
  {
    question: "Is my food diary private?",
    answer:
      "Yes. Your meals and details are tied to your account. Read the Privacy Policy to learn more.",
  },
] as const;

const memoryDetails = [
  {
    label: "Day by day",
    description: "See the meals that shaped your week.",
    icon: CalendarDays,
  },
  {
    label: "The little details",
    description: "Keep the note that brings it back.",
    icon: Heart,
  },
  {
    label: "Places worth returning to",
    description: "Remember where your favorite meals began.",
    icon: MapPin,
  },
] as const;

function WebsiteLandingPage() {
  const revealRoot = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = revealRoot.current;
    if (!root) return;
    const revealItems = root.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8%" },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <main
      ref={revealRoot}
      id="main-content"
      className="website-page min-h-[100dvh] overflow-hidden"
    >
      <a className="website-skip-link" href="#features">
        Skip to features
      </a>
      <nav className="website-nav" aria-label="Main navigation">
        <Link to="/website" className="website-logo" aria-label="Nomory home">
          <NomoryLogo className="text-[28px]" />
        </Link>
        <div className="website-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#questions">FAQ</a>
        </div>
        <Link to="/login" className="website-nav-cta">
          Start your diary <ArrowRight className="size-4" />
        </Link>
      </nav>

      <section className="website-hero" aria-labelledby="website-hero-title">
        <div className="website-hero-art">
          <img
            className="website-hero-image"
            src="/website-hero-mockup.png"
            alt="Nomory app mockup surrounded by cheerful food memory characters"
          />
        </div>
        <div className="website-hero-copy">
          <h1 id="website-hero-title">Your meals, remembered.</h1>
          <p className="website-hero-body">
            Save the meals you love, with the little details that make them yours.
          </p>
          <Link to="/login" className="website-primary-button">
            Save your first meal <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      <section
        id="features"
        aria-labelledby="features-title"
        className="website-section website-features-section"
      >
        <div className="website-section-shell">
          <div className="website-section-heading">
            <h2 id="features-title">Keep the parts that make a meal yours.</h2>
            <p>
              Nomory gives the little details a place to live, without turning food into a chore.
            </p>
          </div>
          <div className="website-feature-grid">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-title"
        className="website-section-shell website-section website-how-section"
      >
        <div className="website-section-heading website-how-heading">
          <h2 id="how-title">Three small moments, kept.</h2>
          <p>Save a meal in seconds, then find it whenever you want to remember.</p>
        </div>
        <div className="website-how-grid">
          {steps.map((step, index) => (
            <HowStep key={step.title} {...step} stepNumber={String(index + 1).padStart(2, "0")} />
          ))}
        </div>
      </section>

      <section
        id="week-remembered"
        aria-labelledby="week-remembered-title"
        className="website-section-shell website-section website-memory-section"
      >
        <div className="website-memory-copy" data-reveal>
          <h2 id="week-remembered-title">A week becomes your story.</h2>
          <p>
            Every photo becomes part of a private diary, ready when you want to remember the moment.
          </p>
          <div className="website-memory-details" aria-label="What Nomory helps you remember">
            {memoryDetails.map(({ label, description, icon: Icon }) => (
              <div className="website-memory-detail" key={label}>
                <span className="website-memory-icon" aria-hidden="true">
                  <Icon className="size-5" strokeWidth={2.2} />
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{description}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="website-memory-visual" data-reveal>
          <img
            src="/illustrations/website-week-remembered.png"
            alt="A pink Nomory character revisiting five meals saved across a weekly diary"
          />
        </div>
      </section>

      <section
        id="questions"
        aria-labelledby="questions-title"
        className="website-section-shell website-section website-questions-section"
      >
        <div className="website-questions-intro">
          <h2 id="questions-title">A diary should feel easy to keep.</h2>
          <p>Simple answers before you save your first meal.</p>
        </div>
        <div className="website-faq-list">
          {questions.map((item) => (
            <details className="website-faq-item" key={item.question}>
              <summary>
                <span>{item.question}</span>
                <span className="website-faq-toggle" aria-hidden="true">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="website-footer-zone">
        <div className="website-section-shell website-final-cta">
          <div className="website-final-copy">
            <h2>
              Start remembering <span>your meals.</span>
            </h2>
            <p>Start with a photo. Add more when you want to.</p>
          </div>
          <Link to="/login" className="website-primary-button website-final-button">
            Save your first meal <ArrowRight className="size-5" />
          </Link>
        </div>
        <footer className="website-footer website-section-shell" aria-label="Footer">
          <div className="website-footer-brand">
            <NomoryLogo className="text-[25px]" />
            <span>Your meals, remembered.</span>
          </div>
          <div className="website-footer-links">
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/login">Start your diary</Link>
          </div>
        </footer>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  preview,
  className,
}: (typeof features)[number]) {
  return (
    <article className={`website-feature-card ${className}`} data-reveal>
      <div className="website-feature-card-header">
        <div className="website-icon-tile">
          <Icon className="size-5" strokeWidth={2.2} />
        </div>
        <div className="website-feature-copy">
          <h3>{title}</h3>
        </div>
      </div>
      <FeaturePreview type={preview} />
      <p className="website-feature-description">{description}</p>
    </article>
  );
}

function FeaturePreview({ type }: { type: (typeof features)[number]["preview"] }) {
  if (type === "photo")
    return (
      <div className="website-feature-preview website-preview-photo">
        <img
          src="/illustrations/website-feature-capture.png"
          alt="Nomory camera character capturing a bowl of pasta"
        />
      </div>
    );
  if (type === "details")
    return (
      <div className="website-feature-preview website-preview-details">
        <img
          src="/illustrations/website-feature-details.png"
          alt="Nomory character keeping meal details and rating"
        />
      </div>
    );
  if (type === "calendar")
    return (
      <div className="website-feature-preview website-preview-calendar">
        <img
          src="/illustrations/website-feature-find-again.png"
          alt="Nomory character revisiting meals on a calendar"
        />
      </div>
    );
  return null;
}

function HowStep({
  title,
  description,
  preview,
  stepNumber,
}: Omit<(typeof steps)[number], "icon"> & { stepNumber: string }) {
  return (
    <article className="website-how-card" data-reveal>
      <div className="website-how-card-top">
        <div className="website-step-number">{stepNumber}</div>
        <ArrowRight className="website-how-arrow size-5" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <HowPreview type={preview} />
    </article>
  );
}

function HowPreview({ type }: { type: (typeof steps)[number]["preview"] }) {
  if (type === "capture")
    return (
      <div className="website-how-preview website-how-capture">
        <FoodSticker
          src="/illustrations/capture-photo.png"
          alt="A meal ready to save"
          className="size-[68px]"
          rounded="rounded-[20px]"
        />
        <span>Choose a photo</span>
      </div>
    );
  if (type === "save") return <MealTypePreview />;
  return (
    <div className="website-how-preview website-how-remember">
      <div className="website-mini-memory-stack">
        <FoodSticker
          src="/illustrations/upload-gallery.png"
          alt="Saved meal memory"
          className="size-12"
          rounded="rounded-[16px]"
        />
        <FoodSticker
          src="/illustrations/capture-photo.png"
          alt="Saved meal memory"
          className="size-12"
          rounded="rounded-[16px]"
        />
        <FoodSticker
          src="/illustrations/empty-memories.png"
          alt="Saved meal memory"
          className="size-12"
          rounded="rounded-[16px]"
        />
      </div>
      <strong>Sunday, Sep 13</strong>
      <span>3 meals saved</span>
    </div>
  );
}

function MealTypePreview() {
  const [selected, setSelected] = useState<MealType>("lunch");
  return (
    <div className="website-how-preview website-how-save" aria-label="Meal type selection preview">
      {MEAL_TYPES.slice(0, 4).map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => setSelected(type.value)}
          data-selected={selected === type.value}
          className="meal-type-option text-[11px] font-semibold"
        >
          {type.label}
        </button>
      ))}
    </div>
  );
}
