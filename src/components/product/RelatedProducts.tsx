import { ProductCard } from "@/components/shop/ProductCard";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";

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
      <h2 className="font-display text-xl font-semibold text-foreground mb-8 text-center">
        {title}
      </h2>

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
