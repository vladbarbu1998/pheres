import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
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

            {/* Quote Block */}
            <div className="relative">
              {/* Decorative quote icon */}
              <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20 rotate-180" />
              
              <blockquote className="pl-8 border-l-2 border-primary/30">
                <p className="font-display text-2xl font-medium leading-relaxed text-foreground md:text-3xl italic">
                  "True elegance is not about following trends—it's about creating 
                  timeless pieces that become part of a woman's story."
                </p>
                <footer className="mt-4 text-muted-foreground">
                  <cite className="not-italic">
                    <span className="font-semibold text-foreground">Narcisa Pheres</span>
                    <span className="block text-sm mt-1">Founder & Creative Director</span>
                  </cite>
                </footer>
              </blockquote>
            </div>

            {/* Story Excerpt */}
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Narcisa Pheres brings decades of passion for exceptional craftsmanship 
                and rare gemstones to every creation. Her journey began in Romania, 
                where she developed an eye for beauty that would later define one of 
                the world's most coveted jewelry houses.
              </p>
              <p>
                Today, Pheres pieces adorn celebrities on red carpets worldwide, each 
                creation a testament to the founder's unwavering vision: jewelry that 
                doesn't merely accessorize but transforms.
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

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">25+</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Years of Excellence</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">100+</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Celebrity Clients</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl font-semibold text-foreground">50+</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Red Carpet Events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
