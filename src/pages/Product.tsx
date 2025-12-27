import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ProductGallery, ProductGallerySkeleton } from "@/components/product/ProductGallery";
import { ProductInfo, ProductInfoSkeleton } from "@/components/product/ProductInfo";
import { ProductDetails } from "@/components/product/ProductDetails";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { EmptyState } from "@/components/shop/EmptyState";
import { ErrorState } from "@/components/shop/ErrorState";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    refetch,
  } = useProduct(slug || "");

  // Get collection IDs for related products query
  const collectionIds =
    product?.product_collections?.map((pc) => pc.collection_id).filter(Boolean) || [];

  const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(
    product?.id || "",
    collectionIds as string[]
  );

  // Get first collection for display
  const primaryCollection = product?.product_collections?.[0]?.collections;

  // Sort images by display order
  const sortedImages = product?.product_images
    ? [...product.product_images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return a.display_order - b.display_order;
      })
    : [];

  // Error state
  if (productError) {
    return (
      <Layout>
        <section className="container py-16">
          <ErrorState
            title="Couldn't load product"
            message="We had trouble loading this product. Please try again."
            onRetry={() => refetch()}
          />
        </section>
      </Layout>
    );
  }

  // Not found state
  if (!productLoading && !product) {
    return (
      <Layout>
        <section className="container py-16">
          <EmptyState
            title="Product not found"
            description="The piece you're looking for doesn't exist or may have been removed from our collection."
            actionLabel="Browse Collection"
            actionHref="/shop"
          />
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 lg:py-12">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/shop">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>

        {/* Main product section */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div>
            {productLoading ? (
              <ProductGallerySkeleton />
            ) : (
              <ProductGallery
                images={sortedImages}
                productName={product?.name || ""}
              />
            )}
          </div>

          {/* Info */}
          <div>
            {productLoading ? (
              <ProductInfoSkeleton />
            ) : (
              <ProductInfo
                name={product!.name}
                price={Number(product!.base_price)}
                compareAtPrice={product!.compare_at_price ? Number(product!.compare_at_price) : null}
                shortDescription={product!.short_description}
                collectionName={primaryCollection?.name || null}
                collectionSlug={primaryCollection?.slug || null}
                metalType={product!.metal_type}
                metalWeight={product!.metal_weight}
                stoneCarat={product!.stone_carat}
                stoneClarity={product!.stone_clarity}
                stoneColor={product!.stone_color}
                stoneCut={product!.stone_cut}
                stoneType={product!.stone_type}
                certification={product!.certification}
                isNew={product!.is_new}
              />
            )}
          </div>
        </div>

        {/* Details section */}
        {!productLoading && product && (
          <ProductDetails
            description={product.description}
            certification={product.certification}
          />
        )}

        {/* Related products */}
        <div className="mt-12">
          <RelatedProducts
            products={relatedProducts || []}
            isLoading={relatedLoading}
          />
        </div>
      </div>
    </Layout>
  );
}
