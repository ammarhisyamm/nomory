import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { NomoryLogo } from "@/components/nomory-logo";
import "@/website.css";

export const Route = createFileRoute("/website")({
  head: () => ({
    meta: [
      { title: "Nomory | Your meals, remembered" },
      { name: "description", content: "A visual food diary for the meals, places, and little details worth remembering." },
      { property: "og:title", content: "Nomory | Your meals, remembered" },
      { property: "og:description", content: "Capture a meal. Keep the moment. Come back to it anytime." },
    ],
  }),
  component: WebsiteLandingPage,
});

const features = [
  { number: "01", title: "Capture your meals", description: "Take a photo or upload one from your gallery. The moment is kept before it slips away.", visual: "capture" },
  { number: "02", title: "Save the details", description: "Add only what helps: meal type, rating, note, price, or location.", visual: "details" },
  { number: "03", title: "Look back anytime", description: "Your meals are organized by day through Calendar and Memories.", visual: "memories" },
] as const;

const steps = [
  { number: "01", title: "Capture", text: "Take or upload a photo." },
  { number: "02", title: "Save", text: "Add details if you want." },
  { number: "03", title: "Remember", text: "Your meal goes straight into your diary." },
] as const;

function WebsiteLandingPage() {
  const [activeDemo, setActiveDemo] = useState<"today" | "calendar" | "memories">("today");

  return (
    <main className="website-page min-h-[100dvh] overflow-hidden">
      <nav className="website-nav" aria-label="Main navigation">
        <Link to="/website" className="website-logo" aria-label="Nomory home"><NomoryLogo className="text-[30px]" /></Link>
        <div className="website-nav-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#memories">Memories</a></div>
        <Link to="/login" className="website-nav-cta">Get started <ArrowRight className="size-4" /></Link>
      </nav>

      <section className="website-hero website-section-shell website-reveal">
        <img className="website-hero-image" src="/website-hero.png" alt="A meal waiting to be remembered by the sea" />
        <div className="website-hero-wash" />
        <div className="website-hero-copy">
          <div className="website-hero-lockup"><NomoryLogo className="text-[36px]" /><span>Food diary for real life</span></div>
          <p className="website-eyebrow">A softer way to keep track</p>
          <h1>Your meals,<br /><span>remembered.</span></h1>
          <p className="website-hero-body">Capture what you eat, save the little details, and look back anytime.</p>
          <div className="website-hero-actions"><Link to="/login" className="website-primary-button">Start your food diary <ArrowRight className="size-5" /></Link><a href="#how-it-works" className="website-text-link">See how it works <ArrowRight className="size-4" /></a></div>
          <div className="website-hero-note"><Check className="size-4" /> Private by default, made for real life</div>
        </div>
        <div className="website-hero-caption">Good food, brighter days.</div>
      </section>

      <section id="features" className="website-section-shell website-section website-features-section website-reveal">
        <div className="website-section-heading"><p className="website-eyebrow">Everything worth keeping</p><h2>A food diary that remembers <span>the good parts.</span></h2><p>Nomory keeps the useful details close without making every meal feel like a task.</p></div>
        <div className="website-bento-grid">{features.map((feature, index) => <FeatureBento key={feature.title} {...feature} index={index} />)}</div>
      </section>

      <section id="how-it-works" className="website-section-shell website-section website-steps-section website-reveal">
        <div className="website-steps-intro"><p className="website-eyebrow">A three-second habit</p><h2>From plate<br />to <span>memory.</span></h2><p>Make a note while it is fresh. Find it again when you are ready for the story.</p></div>
        <div className="website-steps-list">{steps.map((step, index) => <StepCard key={step.number} {...step} index={index} />)}</div>
      </section>

      <section id="memories" className="website-section-shell website-section website-memory-section website-reveal">
        <div className="website-memory-copy"><p className="website-eyebrow">Memories, not metrics</p><h2>A visual diary of everything you&apos;ve eaten.</h2><p>Your meals are automatically organized by day, so old food memories are easy to revisit. Find the bowl you loved, the place you went, or the small detail you almost forgot.</p><Link to="/login" className="website-secondary-button">Explore your memories <ArrowRight className="size-4" /></Link></div>
        <InteractiveDiaryDemo activeDemo={activeDemo} setActiveDemo={setActiveDemo} />
      </section>

      <section className="website-section-shell website-final-cta website-reveal"><div><p className="website-eyebrow">Start with tonight</p><h2>Start remembering<br /><span>your meals.</span></h2><p>One photo is all it takes.</p></div><Link to="/login" className="website-primary-button website-final-button">Save your first meal <ArrowRight className="size-5" /></Link></section>
      <footer className="website-footer website-section-shell"><NomoryLogo className="text-[25px]" /><span>Your meals, remembered.</span><Link to="/login">Get started <ArrowRight className="size-4" /></Link></footer>
    </main>
  );
}

function FeatureBento({ number, title, description, visual, index }: (typeof features)[number] & { index: number }) {
  return <article className={`website-bento-card website-bento-${visual}`} style={{ "--feature-index": index } as CSSProperties}><div className="website-bento-copy"><span className="website-card-number">{number}</span><h3>{title}</h3><p>{description}</p></div>{visual === "capture" ? <CaptureVisual /> : null}{visual === "details" ? <DetailsVisual /> : null}{visual === "memories" ? <MemoriesVisual /> : null}</article>;
}

function CaptureVisual() {
  return <div className="website-capture-visual"><div className="website-camera-window"><img src="/illustrations/capture-photo.png" alt="" /><span className="website-camera-focus" /><span className="website-camera-label">ready to remember</span></div><div className="website-photo-chip">Sunday · 12:42</div></div>;
}

function DetailsVisual() {
  return <div className="website-details-visual" aria-label="Meal details preview"><div className="website-detail-row"><span>Meal name</span><strong>Matcha bowl</strong></div><div className="website-detail-row"><span>Meal type</span><strong className="website-selected-pill">Lunch</strong></div><div className="website-detail-row"><span>Rating</span><strong className="website-stars">★★★★★</strong></div><div className="website-detail-row"><span>Location</span><strong>Jakarta</strong></div><div className="website-detail-line" /><span className="website-detail-save">saved when it matters</span></div>;
}

function MemoriesVisual() {
  return <div className="website-memories-visual" aria-label="Memories grid preview"><div className="website-memory-grid"><img src="/illustrations/upload-gallery.png" alt="" /><img src="/illustrations/capture-photo.png" alt="" /><img src="/illustrations/empty-memories.png" alt="" /><div className="website-memory-grid-more">+12</div></div><div className="website-memory-date"><strong>Sunday, Sep 13</strong><span>5 meals · Today</span></div></div>;
}

function InteractiveDiaryDemo({ activeDemo, setActiveDemo }: { activeDemo: "today" | "calendar" | "memories"; setActiveDemo: (value: "today" | "calendar" | "memories") => void }) {
  return <div className="website-diary-demo"><div className="website-demo-topline"><span>Your diary</span><span>always close</span></div><div className="website-demo-tabs" role="tablist" aria-label="Diary views">{(["today", "calendar", "memories"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeDemo === tab} className={activeDemo === tab ? "is-active" : ""} onClick={() => setActiveDemo(tab)}>{tab}</button>)}</div><div className="website-demo-stage" data-view={activeDemo}>
    {activeDemo === "today" ? <div className="website-demo-today"><div><span className="website-demo-kicker">TODAY</span><strong>Small moments,<br />well kept.</strong></div><img src="/illustrations/capture-photo.png" alt="" /></div> : null}
    {activeDemo === "calendar" ? <div className="website-demo-calendar"><span className="website-demo-kicker">SEPTEMBER 2026</span><strong>Find the day<br />you remember.</strong><div className="website-calendar-days">{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="website-calendar-dots">{Array.from({ length: 21 }, (_, index) => <i key={index} className={index % 4 === 0 || index === 12 ? "is-filled" : ""} />)}</div></div> : null}
    {activeDemo === "memories" ? <div className="website-demo-memories"><span className="website-demo-kicker">MEMORIES</span><strong>Look back<br />with feeling.</strong><div className="website-demo-polaroids"><img src="/illustrations/upload-gallery.png" alt="" /><img src="/illustrations/empty-memories.png" alt="" /></div></div> : null}
  </div><div className="website-demo-hint">Tap a view to wander through your diary <ChevronRight className="size-4" /></div></div>;
}

function StepCard({ number, title, text, index }: (typeof steps)[number] & { index: number }) {
  return <article className="website-step-card" style={{ "--step-index": index } as CSSProperties}><span className="website-step-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="website-step-arrow size-5" /></article>;
}
