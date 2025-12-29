import { useParams, Navigate } from "react-router-dom";

export default function ShopAllRedirect() {
  const { productSlug } = useParams<{ productSlug?: string }>();

  // If there's a product slug, redirect to /product/:slug which handles the proper redirect
  if (productSlug) {
    return <Navigate to={`/product/${productSlug}`} replace />;
  }

  // If just /shop/all, redirect to /shop
  return <Navigate to="/shop" replace />;
}
