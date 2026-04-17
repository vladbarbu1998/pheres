"use client";

import { useParams, useRouter } from "next/navigation";
import { RouterRedirect } from "@/components/RouterRedirect";
import { useProduct } from "@/hooks/useProduct";
import { Layout } from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import Product from "@/views/Product";

/**
 * Handles /shop/all and /shop/all/:productSlug routes.
 * - /shop/all redirects to /shop
 * - /shop/all/:productSlug loads the product page directly
 */
export default function ShopAllRedirect() {
  const { productSlug } = (useParams() as unknown as { productSlug?: string });

  // If just /shop/all (no product slug), redirect to /shop
  if (!productSlug) {
    return <RouterRedirect to="/shop" />;
  }

  // If there's a product slug, render the Product page directly
  // This avoids redirect loops for products without a category
  return <Product />;
}