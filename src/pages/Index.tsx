import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { useCollections } from "@/hooks/useProducts";
import { useFeaturedPress } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { BrandHeritageSection } from "@/components/home/BrandHeritageSection";

export default function Index() {
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const { data: pressEntries } = useFeaturedPress();

  const featuredCollections = collections?.filter(c => c.is_featured).slice(0, 4) || [];
  const displayCollections = featuredCollections.length > 0 ? featuredCollections : (collections?.slice(0, 4) || []);

  return (
    <Layout>
      {/* Full-Screen Hero */}
      <section className="relative h-[calc(100vh-73px)] w-full overflow-hidden">
        {/* Background Image */}
        {/* TODO: Replace /images/hero-model.webp with your actual hero image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-model.webp')" }}
        />
        
        {/* Dark Gradient Overlay - transparent at top, dark at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Brand Text - positioned at bottom center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 lg:pb-32">
          <h1 
            className="font-serif text-4xl font-thin tracking-[0.3em] text-white/90 md:text-5xl lg:text-6xl uppercase animate-fade-in"
            style={{ 
              textShadow: '1px 1px 2px rgba(255,255,255,0.4), -1px -1px 2px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.1)' 
            }}
          >
            Pheres
          </h1>
          <p className="mt-3 font-display text-sm font-medium tracking-[0.2em] text-white/80 uppercase animate-fade-in" style={{ animationDelay: "150ms" }}>
            Fine Jewelry House
          </p>
        </div>
      </section>

      {/* Brand Introduction Section */}
      <section className="bg-background">
        <div className="container py-16 md:py-24 lg:py-28">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Fine Jewelry House
            </p>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
              The Art of Rare Beauty
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Pheres creates extraordinary pieces for those who seek the exceptional. 
              One-of-a-kind diamonds, masterful craftsmanship, and a dedication to 
              timeless elegance—worn by icons on the world's most celebrated stages.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center pt-2">
              <Button asChild size="lg" className="group">
                <Link to="/shop">
                  Explore the Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/story">Discover Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Highlight - Luxury Editorial Design */}
      <section className="bg-background">
        <div className="container py-20 md:py-32">
          <div className="mb-16 text-center">
            <p className="mb-3 font-display text-xs font-medium uppercase tracking-[0.3em] text-primary">
              Curated Collections
            </p>
            <h2 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl">
              Worlds of Wonder
            </h2>
          </div>

          {collectionsLoading ? (
            <div className="grid gap-8 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[4/5] w-full" />
                </div>
              ))}
            </div>
          ) : displayCollections.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2">
              {displayCollections.slice(0, 2).map((collection, index) => (
                <Link
                  key={collection.id}
                  to={`/shop/collection/${collection.slug}`}
                  className="group relative block overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <span className="font-serif text-6xl font-light text-primary/20">
                          {collection.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {/* Permanent gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/20" />
                  </div>
                  
                  {/* Text Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 lg:p-10">
                    <p className="mb-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                      Collection
                    </p>
                    <h3 className="mb-3 font-serif text-2xl font-light tracking-wide text-white md:text-3xl lg:text-4xl">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="mb-4 max-w-md text-sm leading-relaxed text-white/80 line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-white transition-all duration-300 group-hover:gap-3">
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="font-display text-sm tracking-wide text-muted-foreground">
                Collections coming soon
              </p>
            </div>
          )}

          {/* View All Button */}
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg" className="group border-primary/30 hover:border-primary hover:bg-primary/5">
              <Link to="/collections">
                View All Collections
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Press Teaser - Worn by Icons */}
      <section className="border-t border-border/50 bg-primary/5">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Worn by Icons
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {pressEntries && pressEntries.length > 0 ? (
                pressEntries.slice(0, 6).map((entry) => (
                  <span
                    key={entry.id}
                    className="font-display text-lg font-medium text-muted-foreground/80 md:text-xl"
                  >
                    {entry.celebrity_name || entry.title}
                  </span>
                ))
              ) : (
                <>
                  <span className="font-display text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Michelle Obama
                  </span>
                  <span className="font-display text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Rihanna
                  </span>
                  <span className="font-display text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Jennifer Lopez
                  </span>
                  <span className="font-display text-lg font-medium text-muted-foreground/80 md:text-xl">
                    Beyoncé
                  </span>
                  <span className="font-display text-lg font-medium text-muted-foreground/80 md:text-xl">
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
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl mb-4">
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
