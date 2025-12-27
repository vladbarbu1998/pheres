import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { cn } from "@/lib/utils";

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

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading,
  skeletonCount = 8,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4",
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product, index) => {
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
            style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
