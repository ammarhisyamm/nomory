import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      duration={3600}
      icons={{
        success: (
          <img src="/illustrations/toast-success.png" alt="" className="size-7 object-contain" />
        ),
        error: (
          <img src="/illustrations/toast-error.png" alt="" className="size-7 object-contain" />
        ),
        warning: (
          <img src="/illustrations/toast-warning.png" alt="" className="size-7 object-contain" />
        ),
        info: (
          <img src="/illustrations/toast-warning.png" alt="" className="size-7 object-contain" />
        ),
      }}
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
