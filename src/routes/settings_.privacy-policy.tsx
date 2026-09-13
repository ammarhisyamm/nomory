import { createFileRoute } from "@tanstack/react-router";
import { SettingsDetail, DetailSection } from "@/components/settings-detail";
export const Route = createFileRoute("/settings_/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Nomory" },
      { name: "description", content: "How Nomory handles account and meal diary data." },
    ],
  }),
  component: PrivacyPolicyPage,
});
function PrivacyPolicyPage() {
  return (
    <SettingsDetail title="Privacy Policy" subtitle="Effective September 13, 2026">
      <DetailSection title="What Nomory collects">
        <p>
          Account details may include your username, display name, email address, profile picture,
          sign-in provider, and a securely hashed password. Diary content can include meal photos,
          names, types, dates, times, notes, locations, prices, and ratings. Nomory also uses a
          session cookie and receives limited request and device information needed to run and
          protect the service.
        </p>
      </DetailSection>
      <DetailSection title="Why we use it">
        <p>
          We use this data to authenticate you, save and show your food diary, sync it across your
          signed-in devices, process image variants, calculate diary summaries and streaks, provide
          exports, prevent abuse, and maintain reliability.
        </p>
      </DetailSection>
      <DetailSection title="Where data is stored">
        <p>
          Meal metadata is stored in Cloudflare D1 and photos in Cloudflare R2. Your browser keeps
          an IndexedDB cache for faster loading. This cache is account-specific and is replaced by
          the cloud snapshot during sync. Nomory does not claim end-to-end encryption.
        </p>
      </DetailSection>
      <DetailSection title="Sharing">
        <p>
          Nomory uses infrastructure providers such as Cloudflare to host and deliver the service,
          and Google only if you choose Google sign-in. Based on the current product, Nomory does
          not sell personal data or use meal content for third-party advertising.
        </p>
      </DetailSection>
      <DetailSection title="Retention and deletion">
        <p>
          Your diary remains available while your account uses the service. Deleting a memory
          removes its database record and associated photo objects. Clear my diary removes all meal
          records and photos for your account. Backups and security logs may persist for a limited
          period where operationally required.
        </p>
      </DetailSection>
      <DetailSection title="Your choices">
        <p>
          You can edit or delete individual memories, clear your diary, download a JSON copy, change
          a password-based account password, or stop using the service. Browser and operating-system
          controls can limit camera, photo-library, and location access.
        </p>
      </DetailSection>
      <DetailSection title="Security and changes">
        <p>
          Nomory uses access-controlled account sessions and hosted infrastructure, but no online
          service can guarantee absolute security. Material policy changes should be reflected on
          this page with an updated effective date.
        </p>
      </DetailSection>
    </SettingsDetail>
  );
}
