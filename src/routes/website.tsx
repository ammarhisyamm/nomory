import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Camera, LockKeyhole, MapPin, NotebookPen, Plus } from "lucide-react";
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
  { title: "Capture a meal", description: "Take a photo in the moment or choose one from your gallery.", icon: Camera, preview: "photo", className: "website-feature-capture" },
  { title: "Keep the details", description: "Save a note, rating, price, location, or leave it beautifully simple.", icon: NotebookPen, preview: "details", className: "website-feature-details" },
  { title: "Find it again", description: "Calendar and Memories keep every meal easy to revisit.", icon: BookOpen, preview: "calendar", className: "website-feature-calendar" },
  { title: "Yours to keep", description: "Your diary stays personal, ready whenever you want to look back.", icon: LockKeyhole, preview: "private", className: "website-feature-private" },
] as const;

const steps = [
  { title: "Capture", description: "Take a photo or choose one from your gallery.", icon: Camera, preview: "capture" },
  { title: "Save", description: "Add the details you want to remember.", icon: NotebookPen, preview: "save" },
  { title: "Remember", description: "Your meal settles into your diary by day.", icon: BookOpen, preview: "remember" },
] as const;

const questions = [
  { question: "Do I need to fill in every detail?", answer: "No. A photo is enough. Add a rating, note, price, or location only when it helps you remember the moment." },
  { question: "Where do my saved meals go?", answer: "Every meal is organized in your Memories and Calendar, so you can return to a day, place, or favorite dish later." },
  { question: "Can I use Nomory on my phone and computer?", answer: "Yes. Sign in to the same account and your diary follows you wherever you open Nomory." },
  { question: "Is my food diary private?", answer: "Yes. Your meals and details are tied to your account. Read the Privacy & Policy for the full explanation." },
] as const;

function WebsiteLandingPage() {
  return <main className="website-page min-h-[100dvh] overflow-hidden">
    <nav className="website-nav" aria-label="Main navigation">
      <Link to="/website" className="website-logo" aria-label="Nomory home"><NomoryLogo className="text-[28px]" /></Link>
      <div className="website-nav-links"><a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#questions">Q&A</a></div>
      <Link to="/login" className="website-nav-cta">Get started <ArrowRight className="size-4" /></Link>
    </nav>

    <section className="website-hero" aria-labelledby="website-hero-title">
      <img className="website-hero-image" src="/website-hero-diary.png" alt="A food diary filled with meal photographs beside a sunny table" />
      <div className="website-hero-copy">
        <p className="website-eyebrow">Your visual food diary</p>
        <h1 id="website-hero-title">Your meals, remembered.</h1>
        <p className="website-hero-body">Capture what you eat, save the little details, and look back anytime.</p>
        <Link to="/login" className="website-primary-button">Start your food diary <ArrowRight className="size-5" /></Link>
      </div>
    </section>

    <section id="features" className="website-section-shell website-section website-features-section">
      <div className="website-section-heading"><p className="website-eyebrow">Made for everyday meals</p><h2>Keep the parts that make a meal yours.</h2><p>Nomory gives the little details a place to live, without turning food into a chore.</p></div>
      <div className="website-feature-grid">{features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}</div>
    </section>

    <section id="how-it-works" className="website-section-shell website-section website-how-section">
      <div className="website-section-heading website-how-heading"><h2>Three small moments, kept.</h2><p>From the first photo to a memory you can return to, everything stays easy.</p></div>
      <div className="website-how-grid">{steps.map((step) => <HowStep key={step.title} {...step} />)}</div>
    </section>

    <section id="questions" className="website-section-shell website-section website-questions-section">
      <div className="website-questions-intro"><p className="website-eyebrow">Questions, answered</p><h2>A diary should feel easy to keep.</h2><p>Everything you need to know before you start saving your next meal.</p></div>
      <div className="website-faq-list">{questions.map((item) => <details className="website-faq-item" key={item.question}><summary><span>{item.question}</span><span className="website-faq-toggle" aria-hidden="true"><Plus className="size-4" /></span></summary><p>{item.answer}</p></details>)}</div>
    </section>

    <section className="website-footer-zone">
      <div className="website-section-shell website-final-cta"><div><p className="website-eyebrow">Start with your next meal</p><h2>Make room for the meals you will want to remember.</h2><p>One photo is all it takes to begin your diary.</p></div><Link to="/login" className="website-primary-button website-final-button">Start your food diary <ArrowRight className="size-5" /></Link></div>
      <footer className="website-footer website-section-shell"><div className="website-footer-brand"><NomoryLogo className="text-[25px]" /><span>Your meals, remembered.</span></div><div className="website-footer-links"><Link to="/privacy-policy">Privacy &amp; Policy</Link><Link to="/login">Get started</Link></div></footer>
    </section>
  </main>;
}

function FeatureCard({ title, description, icon: Icon, preview, className }: (typeof features)[number]) {
  return <article className={`website-feature-card ${className}`}><div className="website-icon-tile"><Icon className="size-5" strokeWidth={2.2} /></div><div className="website-feature-copy"><h3>{title}</h3><p>{description}</p></div><FeaturePreview type={preview} /></article>;
}

function FeaturePreview({ type }: { type: (typeof features)[number]["preview"] }) {
  if (type === "photo") return <div className="website-feature-preview website-preview-photo" aria-hidden="true"><div className="website-preview-photo-window" /><span>Ready when you are</span></div>;
  if (type === "details") return <div className="website-feature-preview website-preview-details" aria-hidden="true"><span>Lunch</span><i /><i /><div><MapPin className="size-3.5" /> Jakarta</div></div>;
  if (type === "calendar") return <div className="website-feature-preview website-preview-calendar" aria-hidden="true"><strong>September</strong><div>{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <span key={`${day}-${index}`} className={index === 2 || index === 5 ? "is-saved" : ""}>{day}</span>)}</div></div>;
  return <div className="website-feature-preview website-preview-private" aria-hidden="true"><LockKeyhole className="size-7" /><span>Your diary stays yours.</span></div>;
}

function HowStep({ title, description, icon: Icon, preview }: (typeof steps)[number]) {
  return <article className="website-how-card"><div className="website-how-card-top"><div className="website-icon-tile"><Icon className="size-5" strokeWidth={2.2} /></div><ArrowRight className="website-how-arrow size-5" /></div><h3>{title}</h3><p>{description}</p><HowPreview type={preview} /></article>;
}

function HowPreview({ type }: { type: (typeof steps)[number]["preview"] }) {
  if (type === "capture") return <div className="website-how-preview website-how-capture" aria-hidden="true"><Camera className="size-5" /><span>Choose a photo</span><div /></div>;
  if (type === "save") return <div className="website-how-preview website-how-save" aria-hidden="true"><span>Meal type</span><strong>Lunch</strong><span>Location</span><strong>Jakarta</strong></div>;
  return <div className="website-how-preview website-how-remember" aria-hidden="true"><strong>Sunday, Sep 13</strong><span>Matcha ube</span><span>Mie ayam</span><span>Saved meal</span></div>;
}
