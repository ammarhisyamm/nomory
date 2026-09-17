import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BookOpen, Camera, NotebookPen, Plus } from "lucide-react";
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
    description: "Take a photo in the moment or choose one from your gallery.",
    icon: Camera,
    preview: "photo",
    className: "website-feature-capture",
  },
  {
    title: "Keep the details",
    description: "Save a note, rating, price, location, or leave it beautifully simple.",
    icon: NotebookPen,
    preview: "details",
    className: "website-feature-details",
  },
  {
    title: "Find it again",
    description: "Calendar and Memories keep every meal easy to revisit.",
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
    description: "Add the details you want to remember.",
    icon: NotebookPen,
    preview: "save",
  },
  {
    title: "Remember",
    description: "Your meal settles into your diary by day.",
    icon: BookOpen,
    preview: "remember",
  },
] as const;

const questions = [
  {
    question: "Do I need to fill in every detail?",
    answer:
      "No. A photo is enough. Add a rating, note, price, or location only when it helps you remember the moment.",
  },
  {
    question: "Where do my saved meals go?",
    answer:
      "Every meal is organized in your Memories and Calendar, so you can return to a day, place, or favorite dish later.",
  },
  {
    question: "Can I use Nomory on my phone and computer?",
    answer: "Yes. Sign in to the same account and your diary follows you wherever you open Nomory.",
  },
  {
    question: "Is my food diary private?",
    answer:
      "Yes. Your meals and details are tied to your account. Read the Privacy & Policy for the full explanation.",
  },
] as const;

function WebsiteLandingPage() {
  return (
    <main id="main-content" className="website-page min-h-[100dvh] overflow-hidden">
      <a className="website-skip-link" href="#features">
        Skip to content
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
          Get started <ArrowRight className="size-4" />
        </Link>
      </nav>

      <section className="website-hero" aria-labelledby="website-hero-title">
        <img
          className="website-hero-image"
          src="/website-hero-mockup.png"
          alt="Nomory app mockup surrounded by cheerful food memory characters"
        />
        <div className="website-hero-copy">
          <h1 id="website-hero-title">Your meals, remembered.</h1>
          <p className="website-hero-body">
            Capture what you eat, save the little details, and look back anytime.
          </p>
          <Link to="/login" className="website-primary-button">
            Start your food diary <ArrowRight className="size-5" />
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
          <p>From the first photo to a memory you can return to, everything stays easy.</p>
        </div>
        <div className="website-how-grid">
          {steps.map((step, index) => (
            <HowStep key={step.title} {...step} stepNumber={String(index + 1).padStart(2, "0")} />
          ))}
        </div>
      </section>

      <section
        id="questions"
        aria-labelledby="questions-title"
        className="website-section-shell website-section website-questions-section"
      >
        <div className="website-questions-intro">
          <h2 id="questions-title">A diary should feel easy to keep.</h2>
          <p>Everything you need to know before you start saving your next meal.</p>
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
            <p>One photo is all it takes.</p>
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
            <Link to="/privacy-policy">Privacy &amp; Policy</Link>
            <Link to="/login">Get started</Link>
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
    <article className={`website-feature-card ${className}`}>
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
    <article className="website-how-card">
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
