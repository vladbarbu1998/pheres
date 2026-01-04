import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  label?: React.ReactNode;
  title: string;
  intro: string;
  className?: string;
}

export function PageHero({ label, title, intro, className }: PageHeroProps) {
  return (
    <section className={cn("py-20 md:py-28 lg:py-36", className)}>
      <div className="container max-w-4xl text-center">
        {label && (
          <p className="mb-4 font-label text-sm font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
            {label}
          </p>
        )}
        <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl animate-fade-in text-balance">
          {title}
        </h1>
        <p 
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in leading-relaxed" 
          style={{ animationDelay: "100ms" }}
        >
          {intro}
        </p>
      </div>
    </section>
  );
}
