"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { CoutureGallery, CoutureGallerySkeleton } from "@/components/couture/CoutureGallery";
import { CoutureInfoPanel, CoutureInfoPanelSkeleton } from "@/components/couture/CoutureInfoPanel";
import { CoutureStorySection } from "@/components/couture/CoutureStorySection";
import { CoutureProvenance } from "@/components/couture/CoutureProvenance";
import { CoutureRelatedPieces } from "@/components/couture/CoutureRelatedPieces";
import { CoutureRecentlyViewed } from "@/components/couture/CoutureRecentlyViewed";
import { CoutureInquiryDialog } from "@/components/couture/CoutureInquiryDialog";
import { EmptyState } from "@/components/shop/EmptyState";
import { ErrorState } from "@/components/shop/ErrorState";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function CoutureProductPage() {
  const { collectionSlug, productSlug } = (useParams() as unknown as { collectionSlug: string; productSlug: string });
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const { addProduct } = useRecentlyViewed();

  // Fetch collection info for breadcrumb and context
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

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addProduct({
        id: product.id,
        slug: product.slug,
        productType: "couture",
      });
    }
  }, [product, addProduct]);

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

  // Compute effective archived status - only product's own flag matters
  // (collection archive cascades to products via database trigger)
  const effectiveArchived = useMemo(() => {
    if (!product) return false;
    return (product as any).archived === true;
  }, [product]);

  // Error state
  if (productError) {
    return (
      <Layout>
        <section className="container py-16">
          <ErrorState
            title="Couldn't load this piece"
            message="We had trouble loading this couture creation. Please try again."
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
            title="Piece not found"
            description="This couture creation doesn't exist or may no longer be available."
            actionLabel="Browse Couture"
            actionHref="/collections/couture"
          />
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
            <div className="bg-secondary/10 min-h-screen">
        {/* Above the fold - 60/40 layout */}
        <section className="container max-w-7xl mx-auto px-4 py-8 lg:py-12">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12">
            {/* Left: Gallery (60%) */}
            <div className="min-w-0">
              {productLoading ? (
                <CoutureGallerySkeleton />
              ) : (
                <CoutureGallery
                  images={sortedImages}
                  productName={product?.name || ""}
                />
              )}
            </div>

            {/* Right: Info Panel (40%) - Sticky on desktop */}
            <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              {productLoading ? (
                <CoutureInfoPanelSkeleton />
              ) : (
                <CoutureInfoPanel
                  productId={product!.id}
                  productName={product!.name}
                  shortDescription={product!.short_description}
                  collectionName={primaryCollection?.name || collection?.name || null}
                  collectionSlug={primaryCollection?.slug || collection?.slug || null}
                  metals={(product as any).product_metals || []}
                  stones={(product as any).product_stones || []}
                  grossWeight={(product as any).gross_weight}
                  size={(product as any).size}
                  certification={product!.certification}
                  productCode={product!.sku}
                  modelNumber={(product as any).model_number}
                  productImageUrl={sortedImages[0]?.image_url || null}
                  isArchived={effectiveArchived}
                  onInquire={() => setInquiryOpen(true)}
                />
              )}
            </div>
          </div>
        </section>

        {/* Mid-page - Craftsmanship */}
        {!productLoading && product && (
          <CoutureStorySection />
        )}

        {/* Lower page - Provenance (placeholder for future data) */}
        <CoutureProvenance
          imageUrl={null}
          eventText={null}
          pressLink={null}
        />

        {/* Related Couture Pieces */}
        <CoutureRelatedPieces
          products={relatedProducts || []}
          isLoading={relatedLoading}
        />

        {/* Recently Viewed Couture */}
        <CoutureRecentlyViewed currentProductId={product?.id} />
      </div>

      {/* Inquiry Dialog */}
      {product && (
        <CoutureInquiryDialog
          open={inquiryOpen}
          onOpenChange={setInquiryOpen}
          productId={product.id}
          productName={product.name}
        />
      )}
    </Layout>
  );
}