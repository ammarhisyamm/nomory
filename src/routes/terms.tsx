import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Nomory" },
      { name: "description", content: "Terms for using Nomory." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-background px-6 py-[max(28px,env(safe-area-inset-top))] pb-12">
      <Link to="/login" aria-label="Back to Nomory" className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]">
        <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
      </Link>
      <header className="mt-7">
        <p className="section-label">Nomory</p>
        <h1 className="mt-1 text-[32px] font-extrabold tracking-tight">Terms of Use</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Effective September 13, 2026</p>
      </header>
      <div className="mt-6 space-y-6 text-[14px] leading-6 text-muted-foreground">
        <section><h2 className="mb-2 text-[19px] font-bold text-foreground">Using Nomory</h2><p>Nomory is a personal food diary. Keep your account credentials private and use the service lawfully. You remain responsible for the content you add.</p></section>
        <section><h2 className="mb-2 text-[19px] font-bold text-foreground">Your content</h2><p>You retain ownership of meal photos and diary details you upload. You give Nomory permission to store and process that content only to provide, secure, and improve the diary service for your account.</p></section>
        <section><h2 className="mb-2 text-[19px] font-bold text-foreground">Availability</h2><p>We aim to keep Nomory reliable, but the service may be changed, maintained, or unavailable from time to time. Keep any records you need independently.</p></section>
        <section><h2 className="mb-2 text-[19px] font-bold text-foreground">Changes and contact</h2><p>We may update these terms as the product changes. Continued use after an update means you accept the revised terms. See the Privacy Policy for information about data handling.</p></section>
      </div>
    </main>
  );
}
