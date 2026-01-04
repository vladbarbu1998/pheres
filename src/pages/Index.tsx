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
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-model.webp')" }}
        />
        
        {/* Dark Gradient Overlay - transparent at top, dark at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Brand Text - positioned at bottom center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 md:pb-24 lg:pb-32">
          <h1 className="font-serif text-4xl font-thin tracking-[0.3em] text-white md:text-5xl lg:text-6xl uppercase animate-fade-in">
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

      {/* Collections Highlight - Card-based design */}
      <section className="border-t border-border/50 bg-secondary/30">
        <div className="container py-16 md:py-24">
          <div className="mb-12 text-center sm:flex sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Curated Collections
              </p>
              <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
                Worlds of Wonder
              </h2>
            </div>
            <Button asChild variant="outline" className="group hidden sm:inline-flex">
              <Link to="/shop">
                View All Collections
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {collectionsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-sm border border-border bg-card overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayCollections.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayCollections.map((collection, index) => (
                <Link
                  key={collection.id}
                  to={`/shop/collection/${collection.slug}`}
                  className="group block rounded-sm border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="font-display text-3xl font-semibold text-primary/40">
                          {collection.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {collection.description}
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                      Explore Collection
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-sm border border-dashed border-border bg-card/50 p-12 text-center">
              <p className="text-muted-foreground">
                Collections coming soon. Check back for our curated worlds of wonder.
              </p>
            </div>
          )}

          {/* Mobile-only button at end of section */}
          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="group">
              <Link to="/shop">
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
