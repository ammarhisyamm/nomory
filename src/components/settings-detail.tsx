import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell, Page, PageHeader } from "./app-shell";

export function SettingsDetail({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <Page>
        <PageHeader
          title={title}
          {...(subtitle ? { subtitle } : {})}
          left={
            <Link
              to="/settings"
              aria-label="Back to settings"
              className="press grid size-11 place-items-center rounded-full bg-card shadow-[var(--shadow-pill)]"
            >
              <ArrowLeft className="size-[19px]" strokeWidth={1.9} />
            </Link>
          }
        />
        {children}
      </Page>
    </AppShell>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 text-[19px] font-bold">{title}</h2>
      <div className="surface-card overflow-hidden p-5 text-[14px] leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
