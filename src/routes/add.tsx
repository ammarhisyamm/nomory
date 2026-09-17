import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AddMealDrawer } from "@/components/add-meal-drawer";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/add")({
  head: () => ({
    meta: [
      { title: "Add a meal | Nomory" },
      {
        name: "description",
        content: "Take a photo of your meal or upload one from your gallery.",
      },
      { property: "og:title", content: "Add a meal" },
      {
        property: "og:description",
        content: "Take a photo of your meal or upload one from your gallery.",
      },
    ],
  }),
  component: AddMealPage,
});

function AddMealPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <AddMealDrawer open onClose={() => navigate({ to: "/" })} />
    </AppShell>
  );
}
