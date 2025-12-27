import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, CartItem as CartItemType } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const price = item.product.base_price + (item.variant?.price_adjustment || 0);
  const lineTotal = price * item.quantity;

  return (
    <div className="flex gap-4 py-6 border-b border-border">
      {/* Image */}
      <Link 
        to={`/product/${item.product.slug}`}
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
              to={`/product/${item.product.slug}`}
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
          <p className="font-display font-semibold text-foreground whitespace-nowrap">
            ${lineTotal.toLocaleString()}
          </p>
        </div>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
