import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartCheckoutLayout } from "@/components/cart/CartCheckoutLayout";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, isLoading, itemCount } = useCart();

  // Loading state
  if (isLoading) {
    return (
      <CartCheckoutLayout
        title="Your Cart"
        backLink={{ to: "/shop", label: "Continue Shopping" }}
        leftContent={
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 py-6 border-b border-border">
                <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-sm" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
        }
        rightContent={<Skeleton className="h-64 rounded-lg" />}
      />
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <Layout>
        <div className="container max-w-6xl py-8 lg:py-12">
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl mb-8">
            Your Cart
          </h1>
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
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
        </div>
      </Layout>
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
