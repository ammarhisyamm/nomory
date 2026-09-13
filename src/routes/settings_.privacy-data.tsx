import { createFileRoute } from "@tanstack/react-router";
import { Cloud, Download, RefreshCw } from "lucide-react";
import { SettingsDetail, DetailSection } from "@/components/settings-detail";
import { toast } from "@/lib/feedback";
import { useMeals } from "@/lib/meals";

export const Route = createFileRoute("/settings_/privacy-data")({
  head: () => ({ meta: [{ title: "Privacy & data | Nomory" }] }),
  component: PrivacyDataPage,
});
function PrivacyDataPage() {
  const { meals, cloudEnabled, syncing, syncNow } = useMeals();
  const exportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), product: "Nomory", memories: meals },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nomory-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Your data copy is ready.", { title: "Export ready" });
  };
  return (
    <SettingsDetail
      title="Privacy & data"
      subtitle="See where your memories live and manage your copy."
    >
      <DetailSection title="Cloud sync">
        <div className="flex items-start gap-3">
          <Cloud className="mt-0.5 size-5 shrink-0 text-accent" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              {cloudEnabled ? "Synced to your account" : "Cloud unavailable"}
            </p>
            <p className="mt-1">
              Signed-in devices read the same cloud diary. This device keeps an offline cache
              refreshed from the cloud.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await syncNow();
            toast.success("Your diary was refreshed.", { title: "Up to date" });
          }}
          disabled={syncing}
          className="press mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-muted font-semibold text-foreground disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />{" "}
          {syncing ? "Syncing…" : "Sync now"}
        </button>
      </DetailSection>
      <DetailSection title="Download your data">
        <p>
          Export meal details, notes, dates, locations, prices, ratings, and stored image references
          as a JSON file.
        </p>
        <button
          type="button"
          onClick={exportData}
          className="press mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-muted font-semibold text-foreground"
        >
          <Download className="size-4" /> Download copy
        </button>
      </DetailSection>
      <DetailSection title="On-device cache">
        <p>
          Nomory keeps a temporary IndexedDB copy for faster loading. When you sign in, cloud data
          is authoritative and replaces stale browser copies.
        </p>
      </DetailSection>
    </SettingsDetail>
  );
}
