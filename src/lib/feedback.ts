export type FeedbackKind = "success" | "error" | "warning" | "info";

type FeedbackDetail = {
  kind: FeedbackKind;
  message: string;
};

function show(kind: FeedbackKind, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<FeedbackDetail>("nomory:feedback", {
      detail: { kind, message },
    }),
  );
}

export const toast = {
  success: (message: string) => show("success", message),
  error: (message: string) => show("error", message),
  warning: (message: string) => show("warning", message),
  info: (message: string) => show("info", message),
};
