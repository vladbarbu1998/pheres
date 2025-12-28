import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      {/* Desktop toaster - top right */}
      <div className="hidden md:block">
        <Sonner
          theme={theme as ToasterProps["theme"]}
          className="toaster group"
          position="top-right"
          closeButton
          duration={4000}
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
              description: "group-[.toast]:text-muted-foreground",
              actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              closeButton: "group-[.toast]:bg-background group-[.toast]:border-border",
            },
          }}
          {...props}
        />
      </div>
      {/* Mobile toaster - bottom center with safe area spacing */}
      <div className="block md:hidden">
        <Sonner
          theme={theme as ToasterProps["theme"]}
          className="toaster group !bottom-20"
          position="bottom-center"
          closeButton
          duration={4000}
          toastOptions={{
            classNames: {
              toast:
                "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:py-3",
              description: "group-[.toast]:text-muted-foreground",
              actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
              cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              closeButton: "group-[.toast]:bg-background group-[.toast]:border-border",
            },
          }}
          {...props}
        />
      </div>
    </>
  );
};

export { Toaster, toast };
