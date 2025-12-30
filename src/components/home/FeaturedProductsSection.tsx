import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCardSkeleton } from "@/components/shop/ProductCardSkeleton";
import { useFeaturedProducts } from "@/hooks/useHomepage";

export function FeaturedProductsSection() {
  const { data, isLoading } = useFeaturedProducts(8);
  const products = data?.products || [];

  // Get hero product and flanking products
  const heroProduct = products[0];
  const leftProducts = products.slice(1, 3);  // 2 products on left
  const rightProducts = products.slice(3, 5); // 2 products on right

  return (
    <section className="border-t border-border/50">
      <div className="container py-16 md:py-24">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left md:mb-14">
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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* 
           * CENTERED SHOWCASE LAYOUT:
           * Desktop: 
           *   |  Prod 2  |           |  Prod 4  |
           *   |  small   |  FEATURED |  small   |
           *   |  Prod 3  |   large   |  Prod 5  |
           *   |  small   |           |  small   |
           * 
           * Mobile: Featured on top, 4 products in 2x2 grid below
           */
          <div className="space-y-6 lg:space-y-0">
            {/* Desktop: Centered layout with flanking products */}
            <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6 lg:items-center">
              {/* Left Column - 2 stacked products */}
              <div className="space-y-6">
                {leftProducts.map((product, index) => (
                  <SmallProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))}
              </div>

              {/* Center - Featured Product (spans 2 columns) */}
              {heroProduct && (
                <Link
                  to={`/product/${heroProduct.slug}`}
                  className="group col-span-2 animate-fade-in"
                >
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                    {(() => {
                      const primaryImage = heroProduct.product_images?.find((img) => img.is_primary);
                      const imageUrl = primaryImage?.image_url || heroProduct.product_images?.[0]?.image_url;
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={heroProduct.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-display text-7xl font-light text-muted-foreground/20">
                            {heroProduct.name.charAt(0)}
                          </span>
                        </div>
                      );
                    })()}
                    
                    {/* New Badge */}
                    {heroProduct.is_new && (
                      <span className="absolute top-5 left-5 bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                        New
                      </span>
                    )}
                  </div>
                  
                  {/* Product Details - Centered */}
                  <div className="pt-5 text-center space-y-1">
                    {heroProduct.product_collections?.[0]?.collections?.name && (
                      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        {heroProduct.product_collections[0].collections.name}
                      </p>
                    )}
                    <h3 className="font-display text-xl font-medium text-foreground transition-colors group-hover:text-primary">
                      {heroProduct.name}
                    </h3>
                    <p className="text-base text-foreground">
                      ${Number(heroProduct.base_price).toLocaleString()}
                    </p>
                    <p className="inline-flex items-center text-sm text-primary pt-1 group-hover:underline">
                      View Details
                      <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              )}

              {/* Right Column - 2 stacked products */}
              <div className="space-y-6">
                {rightProducts.map((product, index) => (
                  <SmallProductCard 
                    key={product.id} 
                    product={product} 
                    index={index + 2}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Layout: Featured + 2x2 Grid */}
            <div className="lg:hidden space-y-6">
              {/* Featured Product */}
              {heroProduct && (
                <Link
                  to={`/product/${heroProduct.slug}`}
                  className="group block animate-fade-in"
                >
                  <div className="relative aspect-square overflow-hidden rounded-sm bg-muted">
                    {(() => {
                      const primaryImage = heroProduct.product_images?.find((img) => img.is_primary);
                      const imageUrl = primaryImage?.image_url || heroProduct.product_images?.[0]?.image_url;
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={heroProduct.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-display text-5xl font-light text-muted-foreground/20">
                            {heroProduct.name.charAt(0)}
                          </span>
                        </div>
                      );
                    })()}
                    
                    {heroProduct.is_new && (
                      <span className="absolute top-3 left-3 bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="pt-4 text-center space-y-1">
                    {heroProduct.product_collections?.[0]?.collections?.name && (
                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                        {heroProduct.product_collections[0].collections.name}
                      </p>
                    )}
                    <h3 className="font-display text-base font-medium text-foreground">
                      {heroProduct.name}
                    </h3>
                    <p className="text-sm text-foreground">
                      ${Number(heroProduct.base_price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              )}

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[...leftProducts, ...rightProducts].map((product, index) => (
                  <SmallProductCard 
                    key={product.id} 
                    product={product} 
                    index={index}
                  />
                ))}
              </div>
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

/* Small Product Card for flanking positions */
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

function SmallProductCard({ 
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
      style={{ animationDelay: `${(index + 1) * 100}ms` }}
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
          <span className="absolute top-2 left-2 bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground lg:top-2.5 lg:left-2.5 lg:px-2 lg:py-0.5 lg:text-[9px]">
            New
          </span>
        )}
      </div>
      
      {/* Product Details */}
      <div className="pt-3 space-y-0.5">
        {collectionName && (
          <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground lg:text-[10px]">
            {collectionName}
          </p>
        )}
        <h3 className="font-display text-xs font-medium text-foreground transition-colors group-hover:text-primary lg:text-sm">
          {product.name}
        </h3>
        <p className="text-[11px] text-foreground lg:text-xs">
          ${Number(product.base_price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
