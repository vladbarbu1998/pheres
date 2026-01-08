import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  archived?: boolean;
  product_images: {
    id?: string;
    image_url: string;
    alt_text?: string | null;
    is_primary: boolean;
    display_order?: number;
  }[];
  product_collections: {
    collection_id: string;
    collections: {
      id?: string;
      name: string;
      slug?: string;
      collection_type?: string;
      archived?: boolean;
    } | null;
  }[];
}

interface CoutureRelatedPiecesProps {
  products: RelatedProduct[];
  isLoading?: boolean;
}

export function CoutureRelatedPieces({ products, isLoading }: CoutureRelatedPiecesProps) {
  // Filter to only couture products
  const coutureProducts = products.filter((product) =>
    product.product_collections?.some(
      (pc) => pc.collections?.collection_type === "couture"
    )
  );

  if (isLoading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container max-w-7xl mx-auto px-4">
          <Skeleton className="h-4 w-32 mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-12" />
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

  if (coutureProducts.length === 0) {
    return null;
  }

  // Limit to 4 products
  const displayProducts = coutureProducts.slice(0, 4);

  return (
    <section className="py-16 md:py-20 border-t border-border/30">
      <div className="container max-w-7xl mx-auto px-4">
        <p className="font-label text-sm font-medium uppercase tracking-[0.25em] text-primary mb-4 text-center">
          Discover More
        </p>
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-12 text-center">
          You May Also Love
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {displayProducts.map((product) => {
            // Get primary image or first image
            const primaryImage = product.product_images?.find((img) => img.is_primary) ||
              product.product_images?.[0];
            
            // Get first couture collection
            const collection = product.product_collections?.find(
              (pc) => pc.collections?.collection_type === "couture"
            )?.collections;

            const productUrl = collection
              ? `/couture/${collection.slug}/${product.slug}`
              : `/couture/collection/${product.slug}`;

            // Only product's own archived flag matters (collection archive cascades via trigger)
            const isEffectivelyArchived = product.archived === true;

            return (
              <Link
                key={product.id}
                to={productUrl}
                className="group block"
              >
                {/* Image - Square ratio, bigger */}
                <div className="relative aspect-square overflow-hidden bg-stone-100 rounded-sm mb-4">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={primaryImage.alt_text || product.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image</span>
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
                {collection && (
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                    {collection.name}
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
