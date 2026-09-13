import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";
import { SettingsDetail } from "@/components/settings-detail";
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
      <PrivacyPolicyContent />
    </SettingsDetail>
  );
}
