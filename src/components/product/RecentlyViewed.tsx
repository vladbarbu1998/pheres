import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useRecentlyViewedProducts } from "@/hooks/useRecentlyViewedProducts";
import { ProductCard } from "@/components/shop/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentlyViewedProps {
  currentProductId?: string;
}

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const { getRecentlyViewed } = useRecentlyViewed();
  const recentItems = getRecentlyViewed("ready_to_wear", currentProductId);
  const productIds = recentItems.slice(0, 4).map((item) => item.id);

  const { data: products, isLoading } = useRecentlyViewedProducts(productIds);

  // Don't render if no items
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="mt-12 lg:mt-16 border-t border-border pt-12">
      <div className="mb-8 text-center">
        <p className="font-label text-sm font-medium uppercase tracking-[0.25em] text-primary mb-2">
          Your History
        </p>
        <h2 className="font-display text-3xl font-semibold text-foreground">
          Recently Viewed
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-sm" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products?.map((product) => {
            const primaryImage = product.product_images?.find((img) => img.is_primary)
              || product.product_images?.[0];
            const primaryCollection = product.product_collections?.[0]?.collections;
            const coutureCollection = product.product_collections?.find(
              (pc) => pc.collections?.collection_type === "couture"
            )?.collections;

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.base_price}
                compareAtPrice={product.compare_at_price}
                imageUrl={primaryImage?.image_url}
                collectionName={primaryCollection?.name}
                collectionType={product.product_type}
                categorySlug={product.categories?.slug}
                coutureCollectionSlug={coutureCollection?.slug}
                isNew={product.is_new}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
