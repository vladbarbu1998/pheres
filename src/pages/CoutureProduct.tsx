import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGallery, ProductGallerySkeleton } from "@/components/product/ProductGallery";
import { ProductInfo, ProductInfoSkeleton } from "@/components/product/ProductInfo";
import { ProductDetails } from "@/components/product/ProductDetails";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { EmptyState } from "@/components/shop/EmptyState";
import { ErrorState } from "@/components/shop/ErrorState";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function CoutureProductPage() {
  const { collectionSlug, productSlug } = useParams<{ collectionSlug: string; productSlug: string }>();

  // Fetch collection info for breadcrumb
  const { data: collection } = useQuery({
    queryKey: ["collection", collectionSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, collection_type")
        .eq("slug", collectionSlug)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!collectionSlug,
  });

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    refetch,
  } = useProduct(productSlug || "");

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
            actionLabel="Browse Couture"
            actionHref="/collections/couture"
          />
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 lg:py-12 overflow-x-hidden">
        {/* Breadcrumb */}
        {productLoading ? (
          <Skeleton className="mb-6 h-5 w-64" />
        ) : (
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/collections/couture">Couture</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {collection && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/couture/${collection.slug}`}>{collection.name}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product?.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Main product section */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="min-w-0">
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
          <div className="min-w-0">
            {productLoading ? (
              <ProductInfoSkeleton />
            ) : (
              <ProductInfo
                productId={product!.id}
                name={product!.name}
                price={Number(product!.base_price)}
                compareAtPrice={product!.compare_at_price ? Number(product!.compare_at_price) : null}
                shortDescription={product!.short_description}
                collectionName={primaryCollection?.name || collection?.name || null}
                collectionSlug={primaryCollection?.slug || collection?.slug || null}
                collectionType={(primaryCollection as any)?.collection_type || collection?.collection_type || "couture"}
                productCode={(product as any).sku}
                metalType={product!.metal_type}
                metalWeight={product!.metal_weight}
                grossWeight={(product as any).gross_weight}
                size={(product as any).size}
                stones={(product as any).product_stones || []}
                certification={product!.certification}
                isNew={product!.is_new}
                variants={(product as any).product_variants || []}
              />
            )}
          </div>
        </div>

        {/* Details section */}
        {!productLoading && product && (
          <div className="mt-12 lg:mt-16">
            <ProductDetails
              description={product.description}
              certification={product.certification}
            />
          </div>
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
