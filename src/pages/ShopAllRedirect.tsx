import { useParams, Navigate } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import Product from "@/pages/Product";

/**
 * Handles /shop/all and /shop/all/:productSlug routes.
 * - /shop/all redirects to /shop
 * - /shop/all/:productSlug loads the product page directly
 */
export default function ShopAllRedirect() {
  const { productSlug } = useParams<{ productSlug?: string }>();

  // If just /shop/all (no product slug), redirect to /shop
  if (!productSlug) {
    return <Navigate to="/shop" replace />;
  }

  // If there's a product slug, render the Product page directly
  // This avoids redirect loops for products without a category
  return <Product />;
}
