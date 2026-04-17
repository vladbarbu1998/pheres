"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

export function CartSummary() {
  const { subtotal, itemCount, updatingItems } = useCart();
  const isUpdating = updatingItems.size > 0;

  return (
    <div className="rounded-sm border border-border bg-card p-6 sticky top-24" data-testid="cart-summary">
      <h2 className="font-display text-xl font-semibold text-foreground mb-6">
        Order Summary
      </h2>

      <div className={cn(
        "space-y-3 text-sm transition-opacity duration-200",
        isUpdating && "opacity-60"
      )}>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-foreground tabular-nums">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>
      </div>

      <div className="border-t border-border my-6" />

      <div className={cn(
        "flex justify-between items-center mb-6 transition-opacity duration-200",
        isUpdating && "opacity-60"
      )}>
        <span className="font-display font-semibold text-lg text-foreground">Estimated Total</span>
        <span className="font-display font-semibold text-xl text-foreground tabular-nums">
          ${subtotal.toLocaleString()}
        </span>
      </div>

      <Button asChild className="w-full" size="lg" disabled={isUpdating || itemCount === 0} data-testid="checkout-button">
        <Link href="/checkout">
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}