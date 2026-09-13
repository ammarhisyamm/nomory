import { createFileRoute, Link } from "@tanstack/react-router";
import { SettingsDetail, DetailSection } from "@/components/settings-detail";
export const Route = createFileRoute("/settings_/help")({
  head: () => ({ meta: [{ title: "Help center | Nomory" }] }),
  component: HelpPage,
});
function HelpPage() {
  return (
    <SettingsDetail title="Help center" subtitle="Quick answers for your food diary.">
      <DetailSection title="Add a meal">
        <p>
          Tap the plus button, take a photo or choose one from your gallery, then add any details
          you want. Nomory confirms success only after the cloud upload finishes.
        </p>
      </DetailSection>
      <DetailSection title="Edit or replace a photo">
        <p>
          Open a memory and choose Edit or Change photo. A replacement gets a new image address so
          Safari, Chrome, and your phone won’t reuse an older cached picture.
        </p>
      </DetailSection>
      <DetailSection title="Sync across devices">
        <p>
          Sign in to the same account everywhere. Nomory refreshes on app open, focus, and
          periodically while visible. You can also use Sync now in Privacy & data.
        </p>
      </DetailSection>
      <DetailSection title="A photo won’t load">
        <p>
          Check your connection and reopen the page. Nomory retries the original image
          automatically. If both cloud copies are unavailable, replace the photo from the memory
          detail page.
        </p>
      </DetailSection>
      <DetailSection title="Delete a memory">
        <p>
          Open its detail page, tap Delete memory, and confirm. The meal metadata and associated
          cloud photo variants are removed.
        </p>
      </DetailSection>
      <p className="my-7 text-center text-[13px] text-muted-foreground">
        Learn more in the{" "}
        <Link to="/settings/privacy-policy" className="font-semibold text-accent">
          Privacy Policy
        </Link>
        .
      </p>
    </SettingsDetail>
  );
}
