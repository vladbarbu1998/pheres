import { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";

interface LegalLayoutProps {
  title: string;
  children: ReactNode;
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  return (
    <Layout>
      <div className="container py-12 lg:py-16">
        {/* Hero heading */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-3xl">
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}