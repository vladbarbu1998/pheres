import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartCheckoutLayout } from "@/components/cart/CartCheckoutLayout";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { trackViewCart, type AnalyticsProduct } from "@/hooks/useAnalytics";

export default function Cart() {
  const { items, isLoading, itemCount, subtotal } = useCart();

  // Track view_cart when items are loaded
  useEffect(() => {
    if (!isLoading && items.length > 0) {
      const analyticsItems: AnalyticsProduct[] = items.map(item => ({
        id: item.productId,
        name: item.product.name,
        price: item.product.base_price + (item.variant?.price_adjustment || 0),
        variant: item.variant?.name || null,
        quantity: item.quantity
      }));
      trackViewCart(analyticsItems, subtotal);
    }
  }, [isLoading, items, subtotal]);

  // Loading state - use Layout directly like Checkout does
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <CartCheckoutLayout
        title="Your Cart"
        backLink={{ to: "/shop", label: "Continue Shopping" }}
        leftContent={
          <div className="text-center py-16 border border-dashed border-border rounded-sm" data-testid="empty-state">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/50 mb-6" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Discover our collection of extraordinary jewelry pieces crafted with 
              exceptional attention to detail.
            </p>
            <Button asChild size="lg">
              <Link to="/shop">Explore the Collection</Link>
            </Button>
          </div>
        }
        rightContent={<div />}
      />
    );
  }

  // Cart with items
  return (
    <CartCheckoutLayout
      title="Your Cart"
      backLink={{ to: "/shop", label: "Continue Shopping" }}
      subtitle={`${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`}
      leftContent={
        <div>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
      }
      rightContent={<CartSummary />}
    />
  );
}
