import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { useCollections } from "@/hooks/useProducts";
import { useFeaturedProducts } from "@/hooks/useHomepage";
import { useFeaturedPress } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: collections, isLoading: collectionsLoading } = useCollections();
  const { data: productsData, isLoading: productsLoading } = useFeaturedProducts();
  const { data: pressEntries } = useFeaturedPress();

  const featuredCollections = collections?.filter(c => c.is_featured).slice(0, 4) || [];
  const displayCollections = featuredCollections.length > 0 ? featuredCollections : (collections?.slice(0, 4) || []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Fine Jewelry House
              </p>
              <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                The Art of Rare Beauty
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
                Pheres creates extraordinary pieces for those who seek the exceptional. 
                One-of-a-kind diamonds, masterful craftsmanship, and a dedication to 
                timeless elegance—worn by icons on the world's most celebrated stages.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted animate-fade-in" style={{ animationDelay: "150ms" }}>
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80"
                alt="Pheres fine jewelry"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Collections Highlight */}
      <section className="border-t border-border/50 bg-secondary/30">
        <div className="container py-16 md:py-24">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Curated Collections
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Worlds of Wonder
            </h2>
          </div>

          {collectionsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] w-full rounded-sm" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : displayCollections.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {displayCollections.map((collection, index) => (
                <Link
                  key={collection.id}
                  to={`/shop/collection/${collection.slug}`}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                    {collection.image_url ? (
                      <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="font-display text-2xl font-semibold text-primary/40">
                          {collection.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collection.description}
                      </p>
                    )}
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
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16 md:py-24">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Featured Pieces
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              The Extraordinary
            </h2>
          </div>
          <Button asChild variant="outline" className="group">
            <Link to="/shop">
              View All Pieces
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {productsLoading ? (
          <ProductGrid products={[]} isLoading={true} skeletonCount={4} />
        ) : productsData && productsData.products.length > 0 ? (
          <ProductGrid products={productsData.products} />
        ) : (
          <div className="rounded-sm border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">
              Our collection is being curated. Extraordinary pieces arriving soon.
            </p>
          </div>
        )}
      </section>

      {/* Press Teaser */}
      <section className="border-t border-b border-border/50 bg-primary/5">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
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
              <Link to="/press">
                Seen on Red Carpets Worldwide
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="relative aspect-square overflow-hidden rounded-sm bg-muted order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=800&q=80"
              alt="Pheres jewelry craftsmanship"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-6 order-1 lg:order-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              The Pheres Difference
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl text-balance">
              Crafted for the Extraordinary
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Every Pheres creation begins with a singular vision: to transform the 
                world's rarest stones into wearable works of art. Our master artisans 
                work with diamonds of exceptional provenance, each selected for its 
                unique character and brilliance.
              </p>
              <p>
                From sketch to final polish, our pieces undergo months of meticulous 
                craftsmanship. We believe true luxury cannot be rushed—it must be 
                earned through patience, precision, and an unwavering commitment to 
                perfection.
              </p>
            </div>
            <Button asChild variant="outline" className="group">
              <Link to="/story">
                Learn More About Pheres
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <Button asChild size="lg" className="group">
              <Link to="/shop">
                Explore the Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Schedule a Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
