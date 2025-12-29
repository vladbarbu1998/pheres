import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

interface CartCheckoutLayoutProps {
  title: string;
  backLink: {
    to: string;
    label: string;
  };
  subtitle?: ReactNode;
  leftContent: ReactNode;
  rightContent: ReactNode;
  /** Content to render outside the grid (e.g., dialogs) */
  extraContent?: ReactNode;
  /** Wrap leftContent in a form */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
}

export function CartCheckoutLayout({
  title,
  backLink,
  subtitle,
  leftContent,
  rightContent,
  extraContent,
  formProps,
}: CartCheckoutLayoutProps) {
  const gridContent = (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Left Column */}
      <div className="space-y-8">
        {leftContent}
      </div>
      {/* Right Column - Order Summary */}
      <div className="lg:sticky lg:top-24 h-fit">
        {rightContent}
      </div>
    </div>
  );

  return (
    <Layout>
      {extraContent}
      <div className="container max-w-6xl py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={backLink.to}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLink.label}
          </Link>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <div className="mt-2 text-sm text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>

        {/* Main Content */}
        {formProps ? (
          <form {...formProps}>
            {gridContent}
          </form>
        ) : (
          gridContent
        )}
      </div>
    </Layout>
  );
}
