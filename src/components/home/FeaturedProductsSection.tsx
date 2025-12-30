import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { useFeaturedProducts } from "@/hooks/useHomepage";

export function FeaturedProductsSection() {
  const { data, isLoading } = useFeaturedProducts(8);
  const products = data?.products || [];

  // Get hero product (first one) and remaining products
  const heroProduct = products[0];
  const gridProducts = products.slice(1, 5);

  return (
    <section className="border-t border-border/50">
      <div className="container py-16 md:py-24">
        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Featured Pieces
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              New Arrivals & Icons
            </h2>
          </div>
          <Button asChild variant="outline" className="group">
            <Link to="/shop">
              View All Pieces
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hero skeleton - hidden on mobile */}
            <div className="relative hidden lg:block lg:row-span-2 overflow-hidden rounded-sm bg-muted animate-pulse aspect-[4/5]" />
            {/* Grid skeletons */}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hero Product - Hidden on mobile, visible on desktop with overlay text */}
            {heroProduct && (
              <Link
                to={`/product/${heroProduct.slug}`}
                className="group relative hidden lg:block lg:row-span-2 animate-fade-in"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted h-full">
                  {(() => {
                    const primaryImage = heroProduct.product_images?.find((img) => img.is_primary);
                    const firstImage = heroProduct.product_images?.[0];
                    const imageUrl = primaryImage?.image_url || firstImage?.image_url;
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={heroProduct.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="font-display text-6xl font-semibold text-primary/30">
                          {heroProduct.name.charAt(0)}
                        </span>
                      </div>
                    );
                  })()}
                  
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  
                  {/* New Badge */}
                  {heroProduct.is_new && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-lg">
                        New
                      </span>
                    </div>
                  )}
                  
                  {/* Product Info - Inside image at bottom left */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="space-y-1">
                      {/* Collection Name */}
                      {heroProduct.product_collections?.[0]?.collections?.name && (
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-background/80">
                          {heroProduct.product_collections[0].collections.name}
                        </p>
                      )}
                      <h3 className="font-display text-xl font-medium text-background">
                        {heroProduct.name}
                      </h3>
                      <p className="text-base text-background">
                        ${Number(heroProduct.base_price).toLocaleString()}
                        {heroProduct.compare_at_price && heroProduct.compare_at_price > heroProduct.base_price && (
                          <span className="ml-2 text-sm text-background/60 line-through">
                            ${Number(heroProduct.compare_at_price).toLocaleString()}
                          </span>
                        )}
                      </p>
                      <span className="inline-flex items-center text-sm text-primary-foreground group-hover:underline pt-1">
                        View Details
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Product Grid - Full width on mobile, right column on desktop */}
            <div className="grid grid-cols-2 gap-4">
              {gridProducts.map((product, index) => {
                const primaryImage = product.product_images?.find((img) => img.is_primary);
                const firstImage = product.product_images?.[0];
                const imageUrl = primaryImage?.image_url || firstImage?.image_url || null;
                const collectionName = product.product_collections?.[0]?.collections?.name || null;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={Number(product.base_price)}
                    compareAtPrice={product.compare_at_price ? Number(product.compare_at_price) : null}
                    imageUrl={imageUrl}
                    collectionName={collectionName}
                    isNew={product.is_new}
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index + 1) * 100}ms` } as React.CSSProperties}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">
              Featured pieces coming soon. Check back for our latest arrivals.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
