import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useFeaturedPress } from "@/hooks/usePress";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BrandHeritageSection } from "@/components/home/BrandHeritageSection";
import universeCouture from "@/assets/universe-couture.jpg";
import universeRtw from "@/assets/universe-rtw.jpg";
export default function Index() {
  const { data: pressEntries } = useFeaturedPress();

  return (
    <Layout>
      {/* Full-Screen Hero */}
      <section className="relative h-[calc(100vh-73px)] w-full overflow-hidden">
        {/* Background Image */}
        {/* TODO: Replace /images/hero-model.webp with your actual hero image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/story-hero.webp')" }}
        />
        
        {/* Dark Gradient Overlay - transparent at top, dark at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Brand Text - positioned at bottom center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 lg:pb-32">
          <h1 
            className="brand-word text-4xl font-thin tracking-[0.3em] text-white/90 md:text-5xl lg:text-6xl animate-fade-in"
            style={{ 
              textShadow: '0 1px 2px rgba(0,0,0,0.3)' 
            }}
          >
            Pheres
          </h1>
          <p className="mt-3 font-label text-sm font-medium tracking-[0.2em] text-white/80 uppercase animate-fade-in" style={{ animationDelay: "150ms" }}>
            Fine Jewelry House
          </p>
        </div>
      </section>

      {/* Two Universes Section */}
      <section className="bg-background">
        <div className="container py-20 md:py-32">
          <div className="mb-16 text-center">
            <p className="mb-3 font-label text-sm font-medium uppercase tracking-[0.3em] text-primary">
              Two Universes
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
              The Worlds of <span className="brand-word">Pheres</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            {/* Couture Universe */}
            <Link
              to="/collections/couture"
              className="group block animate-fade-in"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img 
                  src={universeCouture} 
                  alt="Pheres Couture Collection" 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 group-hover:from-black/50" />
              </div>
              
              <div className="pt-8 text-center">
                <h3 className="mb-3 font-display text-3xl font-semibold tracking-wide text-foreground transition-colors duration-300 group-hover:text-primary md:text-4xl">
                  Couture
                </h3>
                <p className="mx-auto mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Extraordinary one-of-a-kind pieces, handcrafted for the most discerning collectors
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary transition-all duration-300 group-hover:gap-3">
                  Enter Universe
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {/* Ready to Wear Universe */}
            <Link
              to="/collections/ready-to-wear"
              className="group block animate-fade-in"
              style={{ animationDelay: "150ms" }}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <img 
                  src={universeRtw} 
                  alt="Pheres Ready to Wear Collection" 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-500 group-hover:from-black/50" />
              </div>
              
              <div className="pt-8 text-center">
                <h3 className="mb-3 font-display text-3xl font-semibold tracking-wide text-foreground transition-colors duration-300 group-hover:text-primary md:text-4xl">
                  Ready to Wear
                </h3>
                <p className="mx-auto mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Timeless elegance for every moment, designed for modern luxury living
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary transition-all duration-300 group-hover:gap-3">
                  Enter Universe
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>


      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Press Teaser - Worn by Icons */}
      <section className="border-t border-border/50 bg-primary/5">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="font-label text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Worn by Icons
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {pressEntries && pressEntries.length > 0 ? (
                pressEntries.slice(0, 6).map((entry) => (
                  <span
                    key={entry.id}
                    className="font-label text-lg font-medium text-muted-foreground/80 md:text-xl"
                  >
                    {entry.celebrity_name || entry.title}
                  </span>
                ))
              ) : (
                <>
                  <span className="font-label text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Michelle Obama
                  </span>
                  <span className="font-label text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Rihanna
                  </span>
                  <span className="font-label text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Jennifer Lopez
                  </span>
                  <span className="font-label text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Beyoncé
                  </span>
                  <span className="font-label text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Lady Gaga
                  </span>
                </>
              )}
            </div>
            <Button asChild variant="link" className="group text-primary">
              <Link to="/celebrities">
                Seen on Red Carpets Worldwide
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brand Heritage Section */}
      <BrandHeritageSection />


      {/* Final CTA */}
      <section className="border-t border-border/50 bg-secondary/30">
        <div className="container py-16 md:py-24 text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl mb-4">
            Begin Your Journey
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground mb-8">
            Discover a world where every piece tells a story of exceptional 
            craftsmanship and timeless elegance.
          </p>
          <Button asChild size="lg" className="group">
            <Link to="/shop">
              Explore the Collection
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
