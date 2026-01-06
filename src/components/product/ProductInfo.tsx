import { useState } from "react";
import { Heart, ShoppingBag, Loader2, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ProductSpecs } from "./ProductSpecs";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Variant {
  id: string;
  name: string;
  price_adjustment: number;
  is_active: boolean;
}

interface ProductStone {
  id?: string;
  stone_type: string;
  stone_carat?: string | null;
  stone_color?: string | null;
  stone_clarity?: string | null;
  stone_cut?: string | null;
  display_order?: number;
}

type CollectionType = "couture" | "ready_to_wear";

interface ProductInfoProps {
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  collectionName?: string | null;
  collectionSlug?: string | null;
  collectionType?: CollectionType | null;
  productCode?: string | null;
  metalType?: string | null;
  metalWeight?: string | null;
  grossWeight?: string | null;
  size?: string | null;
  stones?: ProductStone[];
  certification?: string | null;
  isNew?: boolean;
  variants?: Variant[];
}

export function ProductInfo({
  productId,
  name,
  price,
  compareAtPrice,
  shortDescription,
  collectionName,
  collectionSlug,
  collectionType,
  productCode,
  metalType,
  metalWeight,
  grossWeight,
  size,
  stones = [],
  certification,
  isNew,
  variants = [],
}: ProductInfoProps) {
  const isCouture = collectionType === "couture";
  const { addItem } = useCart();
  const { isFavorited, isToggling, toggle: toggleFavorite } = useFavoriteToggle(productId);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const activeVariants = variants.filter(v => v.is_active);
  const hasVariants = activeVariants.length > 0;
  const selectedVariant = activeVariants.find(v => v.id === selectedVariantId);
  
  const finalPrice = price + (selectedVariant?.price_adjustment || 0);
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariantId) {
      return; // Require variant selection
    }

    setIsAdding(true);
    // Add item with selected quantity in a single request
    await addItem(productId, selectedVariantId, quantity);
    setIsAdding(false);
    setJustAdded(true);
    setQuantity(1); // Reset quantity after adding
    setTimeout(() => setJustAdded(false), 2000);
  };

  const canAddToCart = !hasVariants || selectedVariantId;

  return (
    <div className="flex flex-col gap-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {isNew && (
          <span className="bg-foreground px-3 py-1 font-label text-xs font-medium tracking-wide text-background">
            NEW ARRIVAL
          </span>
        )}
        {hasDiscount && (
          <span className="bg-primary px-3 py-1 font-label text-xs font-medium tracking-wide text-primary-foreground">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Collection link */}
      {collectionName && collectionSlug && (
        <Link
          to={`/shop/collection/${collectionSlug}`}
          className="font-label text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          {collectionName} Collection
        </Link>
      )}

      {/* Name */}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
        {name}
      </h1>

      {/* Price - hide for Couture */}
      {isCouture ? (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-xl font-medium text-muted-foreground italic">
            Price Upon Request
          </span>
        </div>
      ) : (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-2xl font-semibold text-foreground">
            ${finalPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-lg text-muted-foreground line-through">
              ${compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Short description */}
      {shortDescription && (
        <div 
          className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(shortDescription) }}
        />
      )}

      {/* Variant selector - only for purchasable products */}
      {!isCouture && hasVariants && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Select Option
          </label>
          <Select value={selectedVariantId || ""} onValueChange={setSelectedVariantId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an option" />
            </SelectTrigger>
            <SelectContent>
              {activeVariants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.name}
                  {variant.price_adjustment !== 0 && (
                    <span className="text-muted-foreground ml-2">
                      ({variant.price_adjustment > 0 ? "+" : ""}${variant.price_adjustment.toLocaleString()})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-4 pt-2">
        {isCouture ? (
          /* Couture: Get in Touch CTA */
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full h-12 px-8"
              asChild
            >
              <Link to="/contact?inquiry=couture">
                <Mail className="mr-2 h-4 w-4" />
                Inquire About This Piece
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              This is a one-of-a-kind couture piece. Contact us for availability and pricing.
            </p>
          </div>
        ) : (
          /* Ready To Wear: Standard cart flow */
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                disabled={isAdding}
                className="shrink-0 [&_button]:h-11 [&_input]:h-11"
              />
              <Button 
                className="flex-1 h-11 min-h-11 px-8"
                onClick={handleAddToCart}
                disabled={!canAddToCart || isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : justAdded ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {hasVariants && !selectedVariantId ? "Select an option" : "Add to Cart"}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        <Button 
          variant="outline"
          className="w-full h-11 px-8 sm:w-auto"
          onClick={toggleFavorite}
          disabled={isToggling}
        >
          <Heart className={cn("mr-2 h-4 w-4", isFavorited && "fill-primary text-primary")} />
          {isFavorited ? "In Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      {/* Specs */}
      <div className="pt-6 border-t border-border">
        <ProductSpecs
          productCode={productCode}
          metalType={metalType}
          metalWeight={metalWeight}
          grossWeight={grossWeight}
          size={size}
          stones={stones}
          certification={certification}
          collectionName={collectionName}
        />
      </div>
    </div>
  );
}

export function ProductInfoSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="pt-6 border-t border-border space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
