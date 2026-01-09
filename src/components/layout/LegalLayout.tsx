import { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="container py-12 lg:py-16">
      {/* Hero heading */}
      <div className="mb-12 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {lastUpdated && (
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
