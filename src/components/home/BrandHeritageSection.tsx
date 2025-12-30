import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import narcisaPhoto from "@/assets/narcisa-pheres-founder.jpg";

export function BrandHeritageSection() {
  return (
    <section className="border-t border-border/50 overflow-hidden">
      <div className="container py-16 md:py-24">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Our Heritage
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            The Pheres Story
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-start">
          {/* Portrait Side - 2 columns */}
          <div className="lg:col-span-2 animate-fade-in">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
              <img
                src={narcisaPhoto}
                alt="Narcisa Pheres - Founder"
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-display text-xl font-semibold text-foreground">
                Narcisa Pheres
              </h3>
              <p className="text-sm text-muted-foreground">
                Founder
              </p>
            </div>
          </div>

          {/* Content Side - 3 columns */}
          <div 
            className="lg:col-span-3 space-y-6 animate-fade-in"
            style={{ animationDelay: "150ms" }}
          >
            <div className="space-y-5 text-muted-foreground leading-relaxed">
              <p className="text-lg">
                PHERES brings luxury back to its roots by creating very exclusive products 
                of extremely high quality that the niche market of connoisseurs truly appreciates.
              </p>
              <p>
                Narcisa Pheres, a line dedicated exclusively for fine jewelry, enthuses with 
                one-of-a-kind diamonds and resonates opulence for the high-end market.
              </p>
              <p>
                Founded by designer Narcisa Pheres over a decade ago as a highly exclusive 
                Italian fashion house, PHERES has taken on a new life of its own. PHERES 
                maintains its focus on creating unique luxury experiences that walk the fine 
                line between elegance and extravagance—tearing down walls of limitation and 
                boldly innovating a symbiosis of style.
              </p>
              <p>
                Among the PHERES brand are the Narcisa Pheres Fine Jewelry pieces that have 
                been gracing many a red carpet event. With these pieces, in the belief that 
                true opulence is in the detail, the greatest of consideration and care is 
                paid to even the smallest of steps in the design and creation process.
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4 sm:flex-row pt-4">
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
