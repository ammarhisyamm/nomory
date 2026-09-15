import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Camera,
  Check,
  Images,
  MapPin,
  NotebookPen,
  Sparkles,
  Star,
} from "lucide-react";
import { NomoryLogo } from "@/components/nomory-logo";

export const Route = createFileRoute("/website")({
  head: () => ({
    meta: [
      { title: "Nomory | Your meals, remembered" },
      {
        name: "description",
        content: "A simple visual diary for the meals, places, and little details worth remembering.",
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
    icon: Camera,
    title: "Capture your meals",
    description: "Take a photo or choose one from your gallery. One small moment, saved.",
    tone: "orange",
  },
  {
    icon: NotebookPen,
    title: "Save the details",
    description: "Add a meal type, rating, note, price, or location when it helps you remember.",
    tone: "yellow",
  },
  {
    icon: CalendarDays,
    title: "Look back anytime",
    description: "Browse your meals by day through Calendar and Memories, all in one place.",
    tone: "leaf",
  },
];

const steps = [
  { number: "01", title: "Capture", text: "Take or upload a photo.", icon: Camera },
  { number: "02", title: "Save", text: "Add details if you want.", icon: Bookmark },
  { number: "03", title: "Remember", text: "Your meal goes straight into your diary.", icon: Sparkles },
];

function WebsiteLandingPage() {
  return (
    <main className="website-page min-h-[100dvh] overflow-hidden">
      <nav className="website-nav" aria-label="Main navigation">
        <Link to="/website" className="website-logo" aria-label="Nomory home">
          <NomoryLogo className="text-[30px]" />
        </Link>
        <div className="website-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#memories">Memories</a>
        </div>
        <Link to="/login" className="website-nav-cta">
          Get started <ArrowRight className="size-4" />
        </Link>
      </nav>

      <section className="website-hero website-section-shell">
        <div className="website-hero-copy">
          <p className="website-eyebrow"><Sparkles className="size-4" /> A softer way to keep track</p>
          <h1>Your meals,<br /><span>remembered.</span></h1>
          <p className="website-hero-body">
            Capture what you eat, save the little details, and look back anytime.
          </p>
          <div className="website-hero-actions">
            <Link to="/login" className="website-primary-button">
              Start your food diary <ArrowRight className="size-5" />
            </Link>
            <a href="#how-it-works" className="website-text-link">See how it works <ArrowRight className="size-4" /></a>
          </div>
          <div className="website-hero-note"><Check className="size-4" /> Private by default, made for real life</div>
        </div>

        <div className="website-hero-visual" aria-label="A visual preview of your meal diary">
          <div className="website-hero-orbit website-hero-orbit-one" />
          <div className="website-hero-orbit website-hero-orbit-two" />
          <div className="website-photo-card website-photo-card-back">
            <span>Sunday</span>
            <strong>Small moments,<br />worth keeping.</strong>
          </div>
          <div className="website-photo-card website-photo-card-front">
            <div className="website-photo-card-top"><span>Today</span><span>12:42</span></div>
            <img src="/illustrations/capture-photo.png" alt="Nomory capture a meal illustration" />
            <div className="website-photo-card-caption">
              <div><strong>One photo</strong><span>and the details you want</span></div>
              <span className="website-photo-arrow"><ArrowRight className="size-4" /></span>
            </div>
          </div>
          <div className="website-floating-tag website-floating-tag-top"><Images className="size-4" /> 24 memories</div>
          <div className="website-floating-tag website-floating-tag-bottom"><MapPin className="size-4" /> Jakarta, Indonesia</div>
        </div>
      </section>

      <section id="features" className="website-section-shell website-section website-features-section">
        <div className="website-section-heading">
          <p className="website-eyebrow">Everything worth keeping</p>
          <h2>A food diary that remembers <span>the good parts.</span></h2>
          <p>Less logging. More living. Nomory keeps the useful details close without making every meal feel like a task.</p>
        </div>
        <div className="website-features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="website-section-shell website-section website-steps-section">
        <div className="website-steps-intro">
          <p className="website-eyebrow">A three-second habit</p>
          <h2>From plate<br />to <span>memory.</span></h2>
          <p>Make a note while it is fresh. Find it again when you are ready for the story.</p>
        </div>
        <div className="website-steps-list">
          {steps.map((step, index) => (
            <StepCard key={step.number} {...step} index={index} />
          ))}
        </div>
      </section>

      <section id="memories" className="website-section-shell website-section website-memory-section">
        <div className="website-memory-visual">
          <div className="website-memory-paper website-memory-paper-one"><span>SEP 13</span><strong>5</strong><small>meals</small></div>
          <div className="website-memory-paper website-memory-paper-two"><span>FAVOURITES</span><strong>Remember<br />what worked.</strong><div className="website-mini-rating"><Star className="size-3.5" fill="currentColor" /> <Star className="size-3.5" fill="currentColor" /> <Star className="size-3.5" fill="currentColor" /> <Star className="size-3.5" fill="currentColor" /> <Star className="size-3.5" fill="currentColor" /></div></div>
          <img src="/illustrations/empty-memories.png" alt="Nomory memory album illustration" />
        </div>
        <div className="website-memory-copy">
          <p className="website-eyebrow">Memories, not metrics</p>
          <h2>A visual diary of everything you&apos;ve eaten.</h2>
          <p>Your meals are automatically organized by day, so old food memories are easy to revisit. Find the bowl you loved, the place you went, or the small detail you almost forgot.</p>
          <div className="website-memory-points">
            <div><Images className="size-5" /><span>Photo-first, always</span></div>
            <div><CalendarDays className="size-5" /><span>Organized by day</span></div>
            <div><Bookmark className="size-5" /><span>Details when you need them</span></div>
          </div>
          <Link to="/login" className="website-secondary-button">Explore your memories <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <section className="website-section-shell website-final-cta">
        <div>
          <p className="website-eyebrow">Start with tonight</p>
          <h2>Start remembering<br /><span>your meals.</span></h2>
          <p>One photo is all it takes.</p>
        </div>
        <Link to="/login" className="website-primary-button website-final-button">Save your first meal <ArrowRight className="size-5" /></Link>
      </section>

      <footer className="website-footer website-section-shell">
        <NomoryLogo className="text-[25px]" />
        <span>Your meals, remembered.</span>
        <Link to="/login">Get started <ArrowRight className="size-4" /></Link>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description, tone, index }: (typeof features)[number] & { index: number }) {
  return (
    <article className={`website-feature-card website-feature-card-${tone}`} style={{ "--feature-index": index } as CSSProperties}>
      <div className="website-feature-icon"><Icon className="size-6" strokeWidth={1.8} /></div>
      <div className="website-card-number">0{index + 1}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="website-card-arrow"><ArrowRight className="size-5" /></span>
    </article>
  );
}

function StepCard({ number, title, text, icon: Icon, index }: (typeof steps)[number] & { index: number }) {
  return (
    <article className="website-step-card" style={{ "--step-index": index } as CSSProperties}>
      <span className="website-step-number">{number}</span>
      <div className="website-step-icon"><Icon className="size-5" strokeWidth={1.8} /></div>
      <div><h3>{title}</h3><p>{text}</p></div>
      <ArrowRight className="website-step-arrow size-5" />
    </article>
  );
}
