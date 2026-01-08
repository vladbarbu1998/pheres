import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";

type CollectionType = "couture" | "ready_to_wear";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price?: number | null;
  is_new?: boolean;
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
  product_collections?: Array<{
    collections: {
      name: string;
      slug?: string;
      collection_type?: CollectionType;
    } | null;
  }>;
}

interface RelatedProductsProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
}

export function RelatedProducts({
  products,
  isLoading,
  title = "You May Also Love",
}: RelatedProductsProps) {
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border pt-12">
      <div className="mb-8 text-center">
        <p className="font-label text-sm font-medium uppercase tracking-[0.25em] text-primary mb-2">
          Curated For You
        </p>
        <h2 className="font-display text-3xl font-semibold text-foreground">
          {title}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 4).map((product, index) => {
            const primaryImage = product.product_images?.find((img) => img.is_primary);
            const firstImage = product.product_images?.[0];
            const imageUrl = primaryImage?.image_url || firstImage?.image_url || null;
            const collectionName = product.product_collections?.[0]?.collections?.name || null;
            
            // Check if couture product
            const coutureCollection = product.product_collections?.find(
              pc => pc.collections?.collection_type === "couture"
            )?.collections;
            const collectionType: CollectionType | null = coutureCollection ? "couture" : null;

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
                collectionType={collectionType}
                coutureCollectionSlug={coutureCollection?.slug}
                isNew={product.is_new}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
