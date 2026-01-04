import { Link } from "react-router-dom";
import { ArrowRight, Gem, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import narcisaPhoto from "@/assets/narcisa-pheres-founder.jpg";

export function BrandHeritageSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle luxury background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background" />
      
      <div className="container relative py-20 md:py-32">
        {/* Elegant centered header */}
        <div className="mb-16 text-center">
          <p className="mb-3 font-label text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Our Heritage
          </p>
          <h2 className="font-display text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl">
            The Story of <span className="brand-word">Pheres</span>
          </h2>
          <div className="mx-auto mt-6 h-px w-24 bg-primary/40" />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20 items-center">
            {/* Portrait Side - elegant framing */}
            <div className="lg:col-span-5 animate-fade-in">
              <div className="relative">
                {/* Decorative border accent */}
                <div className="absolute -inset-3 border border-primary/10 rounded-sm hidden md:block" />
                
                {/* Portrait */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                  <img
                    src={narcisaPhoto}
                    alt="Narcisa Pheres - Founder"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                
                {/* Name card overlay */}
                <div className="absolute -bottom-6 left-6 right-6 bg-card/95 backdrop-blur-sm p-4 text-center border border-border/50 rounded-sm shadow-lg md:left-8 md:right-8">
                  <h3 className="brand-word text-lg font-semibold text-foreground tracking-wide">
                    Narcisa Pheres
                  </h3>
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    Founder & Creative Director
                  </p>
                </div>
              </div>
            </div>

            {/* Content Side - refined typography */}
            <div 
              className="lg:col-span-7 animate-fade-in pt-8 lg:pt-0"
              style={{ animationDelay: "150ms" }}
            >
              <div className="space-y-6">
                {/* Opening statement with decorative border */}
                <p className="border-l-2 border-primary/40 pl-5 font-medium leading-relaxed text-foreground">
                  PHERES brings luxury back to its roots by creating very exclusive 
                  products of extremely high quality that the niche market of 
                  connoisseurs truly appreciates.
                </p>
                
                <div className="space-y-5 text-muted-foreground leading-relaxed">
                  <p>
                    <span className="brand-word">Narcisa Pheres</span>, a line dedicated exclusively for fine jewelry, 
                    enthuses with one-of-a-kind diamonds and resonates opulence for 
                    the high-end market.
                  </p>
                  <p>
                    Founded over a decade ago as a highly exclusive Italian fashion 
                    house, <span className="brand-word">Pheres</span> has taken on a new life of its own—maintaining its 
                    focus on creating unique luxury experiences that walk the fine line 
                    between elegance and extravagance.
                  </p>
                  <p>
                    With the belief that true opulence is in the detail, the greatest 
                    of consideration and care is paid to even the smallest of steps 
                    in the design and creation process.
                  </p>
                </div>
              </div>

              {/* Brand Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-border/50 mt-10">
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-2">
                  <Gem className="h-5 w-5 text-primary" />
                  <h4 className="font-label text-sm font-semibold tracking-wide text-foreground">
                    Handcrafted Excellence
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Each piece meticulously crafted by master artisans
                  </p>
                </div>
                <div className="flex flex-col items-center text-center sm:items-start sm:text-left gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h4 className="font-label text-sm font-semibold tracking-wide text-foreground">
                    Timeless Design
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Enduring elegance that transcends fleeting trends
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-10 flex justify-center sm:justify-start">
                <Button asChild className="group">
                  <Link to="/story">
                    Discover Our Full Story
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
