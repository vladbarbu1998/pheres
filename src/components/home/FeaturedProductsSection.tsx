import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedProducts } from "@/hooks/useHomepage";

export function FeaturedProductsSection() {
  const { data, isLoading } = useFeaturedProducts(8);
  const products = data?.products || [];

  // Main product + 4 grid products
  const mainProduct = products[0];
  const gridProducts = products.slice(1, 5);

  return (
    <section className="border-t border-border/50">
      <div className="container py-16 md:py-24">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left md:mb-12">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-primary">
              Featured Pieces
            </p>
            <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl lg:text-4xl">
              New Arrivals & Icons
            </h2>
          </div>
          <Button asChild variant="outline" size="sm" className="group">
            <Link to="/shop">
              View All Pieces
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <Skeleton className="aspect-square rounded-sm" />
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-square rounded-sm" />
                  <div className="pt-3 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          /* 
           * LAYOUT:
           * Desktop (lg+): Main product (square) on left | 2x2 grid on right
           * Mobile: Main product on top, 2x2 grid below
           */
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            
            {/* MAIN PRODUCT - Square with overlay text */}
            {mainProduct && <MainProductCard product={mainProduct} />}

            {/* GRID PRODUCTS - 2x2 */}
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {gridProducts.map((product, index) => (
                <GridProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
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

/* ============================================
   MAIN PRODUCT CARD
   - Square image with subtle gradient overlay
   - Text at bottom-left using dark/foreground colors
   ============================================ */
interface ProductWithImages {
  id: string;
  slug: string;
  name: string;
  base_price: number;
  compare_at_price?: number | null;
  is_new?: boolean;
  product_images?: Array<{ image_url: string; is_primary: boolean }>;
  product_collections?: Array<{ collections?: { name: string } }>;
}

function MainProductCard({ product }: { product: ProductWithImages }) {
  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;
  const collectionName = product.product_collections?.[0]?.collections?.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative block animate-fade-in"
    >
      {/* Square Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-6xl font-light text-muted-foreground/20">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* New Badge */}
        {product.is_new && (
          <span className="absolute top-4 left-4 bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            New
          </span>
        )}
        
        {/* Product Info Overlay - Bottom Left (no gradient, no View Details) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          <div className="space-y-0.5 md:space-y-1">
            {collectionName && (
              <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-foreground/80 md:text-[11px]">
                {collectionName}
              </p>
            )}
            <h3 className="font-display text-sm font-medium text-foreground md:text-lg">
              {product.name}
            </h3>
            <p className="text-xs text-foreground md:text-sm">
              ${Number(product.base_price).toLocaleString()}
              {product.compare_at_price && product.compare_at_price > product.base_price && (
                <span className="ml-1.5 text-[10px] text-foreground/60 line-through md:text-xs">
                  ${Number(product.compare_at_price).toLocaleString()}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ============================================
   GRID PRODUCT CARD
   - Square image with details below
   - Refined hierarchy: collection, name, price
   ============================================ */
function GridProductCard({ 
  product, 
  index 
}: { 
  product: ProductWithImages; 
  index: number;
}) {
  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;
  const collectionName = product.product_collections?.[0]?.collections?.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col animate-fade-in"
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      {/* Square Image */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-2xl font-light text-muted-foreground/20">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* New Badge */}
        {product.is_new && (
          <span className="absolute top-2 left-2 bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground md:top-3 md:left-3 md:px-2.5 md:py-1 md:text-[10px]">
            New
          </span>
        )}
      </div>
      
      {/* Product Details */}
      <div className="pt-3 space-y-0.5 md:pt-4">
        {collectionName && (
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground md:text-[11px]">
            {collectionName}
          </p>
        )}
        <h3 className="font-display text-sm font-medium text-foreground transition-colors group-hover:text-primary md:text-base">
          {product.name}
        </h3>
        <p className="text-xs text-foreground md:text-sm">
          ${Number(product.base_price).toLocaleString()}
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <span className="ml-1.5 text-[10px] text-muted-foreground line-through md:text-xs">
              ${Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
