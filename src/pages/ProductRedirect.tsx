import { useParams, Navigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Redirect component for old /product/:slug URLs.
 * Redirects to the new /shop/:categorySlug/:productSlug URL structure.
 */
export default function ProductRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } = useProduct(slug || "");

  // While loading, show a loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="flex justify-center">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      </Layout>
    );
  }

  // If product not found or error, redirect to shop
  if (isError || !product) {
    return <Navigate to="/shop" replace />;
  }

  // Get category slug, default to "all" if no category
  const categorySlug = product.categories?.slug || "all";

  // Redirect to new URL structure
  return <Navigate to={`/shop/${categorySlug}/${product.slug}`} replace />;
}
