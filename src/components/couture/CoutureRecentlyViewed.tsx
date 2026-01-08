import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useRecentlyViewedProducts } from "@/hooks/useRecentlyViewedProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface CoutureRecentlyViewedProps {
  currentProductId?: string;
}

export function CoutureRecentlyViewed({ currentProductId }: CoutureRecentlyViewedProps) {
  const { getRecentlyViewed } = useRecentlyViewed();
  const recentItems = getRecentlyViewed("couture", currentProductId);
  const productIds = recentItems.slice(0, 4).map((item) => item.id);

  const { data: products, isLoading } = useRecentlyViewedProducts(productIds);

  // Loading state
  if (isLoading && productIds.length > 0) {
    return (
      <section className="py-16 md:py-20 border-t border-border/30">
        <div className="container max-w-7xl mx-auto px-4">
          <p className="font-label text-sm font-medium uppercase tracking-[0.25em] text-primary mb-4 text-center">
            Your History
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-12 text-center">
            Recently Viewed
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-sm" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no items
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 border-t border-border/30">
      <div className="container max-w-7xl mx-auto px-4">
        <p className="font-label text-sm font-medium uppercase tracking-[0.25em] text-primary mb-4 text-center">
          Your History
        </p>
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-12 text-center">
          Recently Viewed
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => {
            const primaryImage = product.product_images?.find((img) => img.is_primary)
              || product.product_images?.[0];
            const coutureCollection = product.product_collections?.find(
              (pc) => pc.collections?.collection_type === "couture"
            )?.collections;

            const productUrl = coutureCollection
              ? `/couture/${coutureCollection.slug}/${product.slug}`
              : `/couture/${product.slug}`;

            // Check if effectively archived (product archived OR any collection archived)
            const isEffectivelyArchived = product.archived || 
              product.product_collections?.some(
                (pc) => pc.collections?.archived === true
              ) || false;

            return (
              <Link
                key={product.id}
                to={productUrl}
                className="group block"
              >
                {/* Image - Square ratio */}
                <div className="relative aspect-square overflow-hidden bg-stone-100 rounded-sm mb-4">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="brand-word text-lg text-muted-foreground/40">
                        Pheres
                      </span>
                    </div>
                  )}
                  
                  {/* Archive badge */}
                  {isEffectivelyArchived && (
                    <div className="absolute left-3 top-3 z-10">
                      <span className="bg-background/90 backdrop-blur-sm px-2 py-1 font-label text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Archive
                      </span>
                    </div>
                  )}
                  
                  {/* Subtle muting overlay for archived */}
                  {isEffectivelyArchived && (
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                  )}
                </div>

                {/* Collection Name */}
                {coutureCollection && (
                  <p className="font-label text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    {coutureCollection.name}
                  </p>
                )}

                {/* Product Name */}
                <h4 className="font-display text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
