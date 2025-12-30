import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { useFeaturedProducts } from "@/hooks/useHomepage";

export function FeaturedProductsSection() {
  const { data, isLoading } = useFeaturedProducts(8);
  const products = data?.products || [];

  // Get hero product and grid products
  const heroProduct = products[0];
  const rightStackProducts = products.slice(1, 3); // 2 products stacked on right
  const bottomRowProducts = products.slice(3, 5);  // 2 products in bottom row

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
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              <div className="col-span-2 lg:col-span-2 lg:row-span-2">
                <ProductCardSkeleton />
              </div>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          </div>
        ) : products.length > 0 ? (
          /* 
           * ASYMMETRIC GRID LAYOUT:
           * Desktop: 
           *   Row 1: Featured (2/3) | Product 2 (1/3)
           *          Featured       | Product 3 (1/3)
           *   Row 2: Product 4 (1/2) | Product 5 (1/2)
           * 
           * Mobile: 2-column grid, all products
           */
          <div className="space-y-4 md:space-y-6">
            {/* Top Section: Featured + Stacked Products */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              {/* Featured Product - 2/3 width on desktop */}
              {heroProduct && (
                <Link
                  to={`/product/${heroProduct.slug}`}
                  className="group col-span-2 lg:row-span-2 animate-fade-in"
                >
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-muted lg:aspect-[4/3]">
                    {(() => {
                      const primaryImage = heroProduct.product_images?.find((img) => img.is_primary);
                      const imageUrl = primaryImage?.image_url || heroProduct.product_images?.[0]?.image_url;
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={heroProduct.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-display text-6xl font-light text-muted-foreground/20">
                            {heroProduct.name.charAt(0)}
                          </span>
                        </div>
                      );
                    })()}
                    
                    {/* New Badge */}
                    {heroProduct.is_new && (
                      <span className="absolute top-4 left-4 bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        New
                      </span>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="pt-4 space-y-1">
                    {heroProduct.product_collections?.[0]?.collections?.name && (
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground md:text-[11px]">
                        {heroProduct.product_collections[0].collections.name}
                      </p>
                    )}
                    <h3 className="font-display text-base font-medium text-foreground transition-colors group-hover:text-primary md:text-lg">
                      {heroProduct.name}
                    </h3>
                    <p className="text-sm text-foreground">
                      ${Number(heroProduct.base_price).toLocaleString()}
                    </p>
                    <p className="inline-flex items-center text-xs text-primary pt-1 group-hover:underline">
                      View Details
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              )}

              {/* Right Stack - 2 products (hidden on mobile, shown in bottom on mobile) */}
              {rightStackProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  className="hidden lg:flex"
                />
              ))}
            </div>

            {/* Bottom Row - 2 products at 50% each */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {/* On mobile: show all 4 grid products here */}
              {/* On desktop: show only bottom 2 */}
              {rightStackProducts.map((product, index) => (
                <ProductCard 
                  key={`mobile-${product.id}`} 
                  product={product} 
                  index={index}
                  className="lg:hidden"
                />
              ))}
              {bottomRowProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index + 2}
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

/* Product Card Component */
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

function ProductCard({ 
  product, 
  index,
  className = ""
}: { 
  product: ProductWithImages; 
  index: number;
  className?: string;
}) {
  const primaryImage = product.product_images?.find((img) => img.is_primary);
  const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;
  const collectionName = product.product_collections?.[0]?.collections?.name;

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`group flex flex-col animate-fade-in ${className}`}
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
            <span className="font-display text-3xl font-light text-muted-foreground/20">
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
        </p>
      </div>
    </Link>
  );
}
