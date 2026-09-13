import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Nomory" },
      { name: "description", content: "How Nomory handles account and meal diary data." },
    ],
  }),
  component: PublicPrivacyPolicyPage,
});

function PublicPrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[430px] bg-background px-6 py-[max(28px,env(safe-area-inset-top))] pb-12">
      <Link
        to="/login"
        aria-label="Back to Nomory"
        className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
      >
        <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
      </Link>
      <header className="mt-7">
        <p className="section-label">Nomory</p>
        <h1 className="mt-1 text-[32px] font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-1 text-[15px] text-muted-foreground">Effective September 13, 2026</p>
      </header>
      <PrivacyPolicyContent />
    </main>
  );
}
