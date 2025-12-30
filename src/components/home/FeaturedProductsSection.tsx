import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { useFeaturedProducts } from "@/hooks/useHomepage";

export function FeaturedProductsSection() {
  const { data, isLoading } = useFeaturedProducts(8);
  const products = data?.products || [];

  // Get hero product (first one) and remaining products for the grid
  const heroProduct = products[0];
  const gridProducts = products.slice(1, 5);

  return (
    <section className="border-t border-border/50">
      <div className="container py-16 md:py-24">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left md:mb-12">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
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
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={i === 0 ? "hidden lg:block lg:row-span-2" : ""}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* 
           * LAYOUT:
           * - Mobile: 2-column grid with 4 products (hero hidden)
           * - Desktop (lg+): 3-column grid
           *   - Left column: Featured product spanning 2 rows
           *   - Right 2 columns: 2x2 grid of products
           */
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6">
            
            {/* FEATURED PRODUCT - Desktop only, spans 2 rows */}
            {heroProduct && (
              <FeaturedProductCard product={heroProduct} />
            )}

            {/* GRID PRODUCTS - All breakpoints */}
            {gridProducts.map((product, index) => (
              <GridProductCard 
                key={product.id} 
                product={product} 
                index={index}
              />
            ))}
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
   FEATURED PRODUCT CARD (Desktop only)
   - Large square image spanning 2 rows
   - Product details below image
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

function FeaturedProductCard({ product }: { product: ProductWithImages }) {
  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const firstImage = product.product_images?.[0];
  const imageUrl = primaryImage?.image_url || firstImage?.image_url;
  const collectionName = product.product_collections?.[0]?.collections?.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group hidden lg:flex lg:flex-col lg:row-span-2 animate-fade-in"
    >
      {/* Square Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="font-display text-5xl font-light text-muted-foreground/30">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
        
        {/* New Badge */}
        {product.is_new && (
          <span className="absolute top-3 left-3 bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
            New
          </span>
        )}
      </div>
      
      {/* Product Details */}
      <div className="pt-4 space-y-1">
        {collectionName && (
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {collectionName}
          </p>
        )}
        <h3 className="font-display text-base font-medium text-foreground transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <p className="text-sm text-foreground">
          ${Number(product.base_price).toLocaleString()}
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <span className="ml-2 text-xs text-muted-foreground line-through">
              ${Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </p>
        <p className="inline-flex items-center text-xs text-primary pt-1 group-hover:underline">
          View Details
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

/* ============================================
   GRID PRODUCT CARD
   - Square image with clean details below
   - Visible on all breakpoints
   ============================================ */
function GridProductCard({ product, index }: { product: ProductWithImages; index: number }) {
  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const firstImage = product.product_images?.[0];
  const imageUrl = primaryImage?.image_url || firstImage?.image_url;
  const collectionName = product.product_collections?.[0]?.collections?.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col animate-fade-in"
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      {/* Square Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="font-display text-3xl font-light text-muted-foreground/30">
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
      <div className="pt-3 space-y-0.5 md:pt-4 md:space-y-1">
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
            <span className="ml-1.5 text-[10px] text-muted-foreground line-through md:ml-2 md:text-xs">
              ${Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
