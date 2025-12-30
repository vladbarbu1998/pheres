import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import narcisaPhoto from "@/assets/narcisa-pheres-founder.jpg";

export function BrandHeritageSection() {
  return (
    <section className="border-t border-border/50 bg-secondary/30 overflow-hidden">
      <div className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Portrait Side */}
          <div className="relative animate-fade-in">
            {/* Decorative frame */}
            <div className="absolute -inset-4 border border-primary/20 rounded-sm -z-10 hidden md:block" />
            <div className="absolute -inset-8 border border-primary/10 rounded-sm -z-20 hidden lg:block" />
            
            {/* Main portrait */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted shadow-2xl shadow-foreground/5">
              <img
                src={narcisaPhoto}
                alt="Narcisa Pheres - Founder & Creative Director"
                className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating accent */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-sm -z-10 hidden md:block" />
          </div>

          {/* Content Side */}
          <div 
            className="space-y-8 animate-fade-in lg:pl-4"
            style={{ animationDelay: "150ms" }}
          >
            {/* Section Label */}
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Our Heritage
            </p>

            {/* Founder Name */}
            <h3 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Narcisa Pheres
            </h3>
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Founder
            </p>

            {/* Story Excerpt */}
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                PHERES brings luxury back to its roots by creating very exclusive products 
                of extremely high quality that the niche market of connoisseurs truly appreciates.
              </p>
              <p>
                Founded by designer Narcisa Pheres over a decade ago as a highly exclusive 
                Italian fashion house, PHERES has taken on a new life of its own—maintaining 
                its focus on creating unique luxury experiences that walk the fine line between 
                elegance and extravagance.
              </p>
              <p>
                With the belief that true opulence is in the detail, the greatest of consideration 
                and care is paid to even the smallest of steps in the design and creation process.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="group">
                <Link to="/story">
                  Discover Our Full Story
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="group">
                <Link to="/celebrities">
                  See Who Wears Pheres
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
