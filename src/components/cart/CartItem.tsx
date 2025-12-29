import { Link } from "react-router-dom";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { useCart, CartItem as CartItemType } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, updatingItems } = useCart();
  const price = item.product.base_price + (item.variant?.price_adjustment || 0);
  const lineTotal = price * item.quantity;
  const isUpdating = updatingItems.has(item.id);
  
  // Build product URL with category
  const productUrl = item.product.category_slug 
    ? `/shop/${item.product.category_slug}/${item.product.slug}` 
    : `/shop/all/${item.product.slug}`;

  return (
    <div 
      className={cn(
        "flex gap-4 py-6 border-b border-border transition-opacity duration-200",
        isUpdating && "opacity-60"
      )}
      data-testid="cart-item"
    >
      {/* Image */}
      <Link 
        to={productUrl}
        className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-sm overflow-hidden"
      >
        {item.product.image_url ? (
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="font-display text-2xl text-primary/30">
              {item.product.name.charAt(0)}
            </span>
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-4">
          <div>
            <Link 
              to={productUrl}
              className="font-display font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
            >
              {item.product.name}
            </Link>
            {item.variant && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.variant.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              ${price.toLocaleString()}
            </p>
          </div>
          <p className="font-display font-semibold text-foreground whitespace-nowrap transition-all duration-200">
            ${lineTotal.toLocaleString()}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-4">
          <QuantityInput
            value={item.quantity}
            onChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
            disabled={isUpdating}
            size="sm"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
            disabled={isUpdating}
            data-testid="remove-item-button"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
