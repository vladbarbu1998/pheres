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

      {/* Two Universes Section - Split Screen Cinematic */}
      <section className="relative">
        {/* Section Header */}
        <div className="bg-background py-12 md:py-16 text-center">
          <p className="text-xs tracking-[0.3em] text-primary uppercase mb-3">
            Two Universes
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
            The Worlds of <span className="brand-word">Pheres</span>
          </h2>
        </div>

        {/* Split Screen Container */}
        <div className="flex flex-col md:flex-row min-h-[70vh] md:min-h-[85vh]">
          {/* Couture - Left */}
          <Link 
            to="/collections/couture" 
            className="group relative flex-1 overflow-hidden min-h-[50vh] md:min-h-0"
          >
            <img 
              src={universeCouture} 
              alt="Pheres Couture Collection" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 text-center text-white px-6">
              <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wide">
                Couture
              </h3>
              <p className="mt-4 max-w-xs text-sm md:text-base text-white/80 leading-relaxed">
                One-of-a-kind masterpieces crafted for those who seek the extraordinary
              </p>
              <span className="mt-6 flex items-center gap-2 text-sm tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Enter Universe
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Divider Line - desktop only */}
          <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />

          {/* Ready to Wear - Right */}
          <Link 
            to="/collections/ready-to-wear" 
            className="group relative flex-1 overflow-hidden min-h-[50vh] md:min-h-0"
          >
            <img 
              src={universeRtw} 
              alt="Pheres Ready to Wear Collection" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 text-center text-white px-6">
              <h3 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-wide">
                Ready to Wear
              </h3>
              <p className="mt-4 max-w-xs text-sm md:text-base text-white/80 leading-relaxed">
                Timeless elegance designed for everyday moments of luxury
              </p>
              <span className="mt-6 flex items-center gap-2 text-sm tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                Enter Universe
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
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
