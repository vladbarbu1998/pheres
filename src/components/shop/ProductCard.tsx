import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  collectionName?: string | null;
  categorySlug?: string | null;
  isNew?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Variant {
  id: string;
  name: string;
  price_adjustment: number;
  is_active: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  collectionName,
  categorySlug,
  isNew,
  className,
  style,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { isFavorited, isToggling, toggle: toggleFavorite } = useFavoriteToggle(id);
  const [isAdding, setIsAdding] = useState(false);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdding) return;
    setIsAdding(true);

    try {
      // Check if product has variants
      const { data: variantsData, error } = await supabase
        .from("product_variants")
        .select("id, name, price_adjustment, is_active")
        .eq("product_id", id)
        .eq("is_active", true);

      if (error) throw error;

      if (variantsData && variantsData.length > 0) {
        // Has variants - show dialog
        setVariants(variantsData);
        setSelectedVariantId(variantsData[0].id);
        setShowVariantDialog(true);
      } else {
        // No variants - add directly
        await addItem(id, null, 1);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddWithVariant = async () => {
    if (!selectedVariantId || isAdding) return;
    setIsAdding(true);

    try {
      await addItem(id, selectedVariantId, 1);
      setShowVariantDialog(false);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const variantPrice = price + (selectedVariant?.price_adjustment || 0);
  
  // Build product URL with category
  const productUrl = categorySlug 
    ? `/shop/${categorySlug}/${slug}` 
    : `/shop/all/${slug}`;

  return (
    <>
      <article className={cn("group relative", className)} style={style} data-testid="product-card">
        {/* Image container */}
        <Link to={productUrl} className="block">
          <div className="relative aspect-square overflow-hidden bg-secondary/50">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-lg text-muted-foreground/50">
                  PHERES
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {isNew && (
                <span className="bg-foreground px-2 py-1 font-display text-xs font-medium tracking-wide text-background">
                  NEW
                </span>
              )}
              {hasDiscount && (
                <span className="bg-primary px-2 py-1 font-display text-xs font-medium tracking-wide text-primary-foreground">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute right-3 top-3 flex flex-col gap-2">
              {/* Wishlist button */}
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "h-9 w-9 transition-opacity duration-200",
                  isFavorited ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                )}
                aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite();
                }}
                disabled={isToggling}
              >
                <Heart className={cn("h-4 w-4", isFavorited && "fill-primary text-primary")} />
              </Button>
            </div>

            {/* Quick add button - bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="w-full backdrop-blur-sm bg-background/90 hover:bg-background"
                onClick={handleQuickAdd}
                data-testid="quick-add-button"
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </div>
          </div>
        </Link>

        {/* Details */}
        <div className="mt-4 space-y-1">
          {collectionName && (
            <p className="font-display text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {collectionName}
            </p>
          )}
          <Link to={productUrl}>
            <h3 className="font-display text-sm font-medium text-foreground transition-colors hover:text-primary lg:text-base">
              {name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              ${price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ${compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Variant Selection Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Option</Label>
              <RadioGroup
                value={selectedVariantId || ""}
                onValueChange={setSelectedVariantId}
                className="space-y-2"
              >
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                      selectedVariantId === variant.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={variant.id} id={variant.id} />
                      <Label htmlFor={variant.id} className="cursor-pointer font-medium">
                        {variant.name}
                      </Label>
                    </div>
                    <span className="text-sm font-medium">
                      ${(price + variant.price_adjustment).toLocaleString()}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              className="w-full"
              onClick={handleAddWithVariant}
              disabled={!selectedVariantId || isAdding}
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart – ${variantPrice.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}