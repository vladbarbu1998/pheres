import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { ProductGallery, ProductGallerySkeleton } from "@/components/product/ProductGallery";
import { ProductInfo, ProductInfoSkeleton } from "@/components/product/ProductInfo";
import { ProductDetails } from "@/components/product/ProductDetails";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
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
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { trackViewItem } from "@/hooks/useAnalytics";

export default function ProductPage() {
  const { categorySlug, productSlug } = useParams<{ categorySlug: string; productSlug: string }>();
  const navigate = useNavigate();
  const { addProduct } = useRecentlyViewed();

  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    refetch,
  } = useProduct(productSlug || "");

  // Track recently viewed and GA4 view_item (only for RTW products)
  useEffect(() => {
    if (product && product.product_type !== "couture") {
      addProduct({
        id: product.id,
        slug: product.slug,
        productType: "ready_to_wear",
      });
      
      // Track view_item for GA4
      trackViewItem({
        id: product.id,
        name: product.name,
        price: Number(product.base_price),
        category: product.categories?.name || null
      });
    }
  }, [product, addProduct]);

  // Redirect couture products to the correct /couture/ URL
  useEffect(() => {
    if (product?.product_type === "couture") {
      const coutureCollection = product.product_collections?.find(
        (pc: any) => pc.collections?.collection_type === "couture"
      )?.collections;

      if (coutureCollection) {
        navigate(`/couture/${coutureCollection.slug}/${product.slug}`, { replace: true });
      }
    }
  }, [product, navigate]);

  // Get collection IDs for related products query
  const collectionIds =
    product?.product_collections?.map((pc) => pc.collection_id).filter(Boolean) || [];

  const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(
    product?.id || "",
    collectionIds as string[]
  );

  // Get first collection for display
  const primaryCollection = product?.product_collections?.[0]?.collections;
  
  // Get category info
  const category = product?.categories;

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

  // Build JSON-LD for product and breadcrumb
  const productJsonLd = product
    ? [
        {
          "@type": "Product" as const,
          "name": product.name,
          "description": product.short_description || product.description || `${product.name} by PHERES`,
          "image": sortedImages[0]?.image_url || "",
          "brand": { "@type": "Brand", "name": "PHERES" },
          "sku": (product as any).sku || undefined,
          ...(Number(product.base_price) > 0
            ? {
                "offers": {
                  "@type": "Offer",
                  "price": String(product.base_price),
                  "priceCurrency": "USD",
                  "availability": "https://schema.org/InStock",
                  "url": `https://pheres.com/shop/${categorySlug}/${productSlug}`,
                },
              }
            : {
                "offers": {
                  "@type": "Offer",
                  "availability": "https://schema.org/PreOrder",
                  "url": `https://pheres.com/shop/${categorySlug}/${productSlug}`,
                },
              }),
        },
        {
          "@type": "BreadcrumbList" as const,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pheres.com/" },
            { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://pheres.com/shop" },
            ...(category
              ? [{ "@type": "ListItem", "position": 3, "name": category.name, "item": `https://pheres.com/shop/category/${category.slug}` }]
              : []),
            { "@type": "ListItem", "position": category ? 4 : 3, "name": product.name },
          ],
        },
      ]
    : undefined;

  return (
    <Layout>
      {product && (
        <SEOHead
          title={`${product.name} | PHERES`}
          description={product.short_description || product.description?.slice(0, 160) || `Discover ${product.name} by PHERES. Luxury fine jewelry crafted with exceptional materials.`}
          url={`/shop/${categorySlug}/${productSlug}`}
          image={sortedImages[0]?.image_url}
          type="product"
          jsonLd={productJsonLd}
        />
      )}
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
                  <Link to="/shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/shop/category/${category.slug}`}>{category.name}</Link>
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
                collectionName={primaryCollection?.name || null}
                collectionSlug={primaryCollection?.slug || null}
                collectionType={(primaryCollection as any)?.collection_type || null}
                productCode={(product as any).sku}
                metals={(product as any).product_metals || []}
                grossWeight={(product as any).gross_weight}
                size={(product as any).size}
                stones={(product as any).product_stones || []}
                certification={product!.certification}
                isNew={product!.is_new}
                isArchived={effectiveArchived}
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

        {/* Recently viewed */}
        <RecentlyViewed currentProductId={product?.id} />
      </div>
    </Layout>
  );
}
