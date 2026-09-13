export type FeedbackKind = "success" | "error" | "warning" | "info";

type FeedbackDetail = {
  kind: FeedbackKind;
  message: string;
  title?: string;
  eyebrow?: string;
};

type FeedbackOptions = Pick<FeedbackDetail, "title" | "eyebrow">;

function show(kind: FeedbackKind, message: string, options?: FeedbackOptions) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<FeedbackDetail>("nomory:feedback", {
      detail: { kind, message, ...options },
    }),
  );
}

export const toast = {
  success: (message: string, options?: FeedbackOptions) => show("success", message, options),
  error: (message: string, options?: FeedbackOptions) => show("error", message, options),
  warning: (message: string, options?: FeedbackOptions) => show("warning", message, options),
  info: (message: string, options?: FeedbackOptions) => show("info", message, options),
};
