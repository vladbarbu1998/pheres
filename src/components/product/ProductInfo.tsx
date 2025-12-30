import { useState } from "react";
import { Heart, ShoppingBag, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ProductSpecs } from "./ProductSpecs";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { cn } from "@/lib/utils";
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

interface ProductInfoProps {
  productId: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  collectionName?: string | null;
  collectionSlug?: string | null;
  metalType?: string | null;
  metalWeight?: string | null;
  grossWeight?: string | null;
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
  metalType,
  metalWeight,
  grossWeight,
  stones = [],
  certification,
  isNew,
  variants = [],
}: ProductInfoProps) {
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
          <span className="bg-foreground px-3 py-1 text-xs font-medium tracking-wide text-background">
            NEW ARRIVAL
          </span>
        )}
        {hasDiscount && (
          <span className="bg-primary px-3 py-1 text-xs font-medium tracking-wide text-primary-foreground">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Collection link */}
      {collectionName && collectionSlug && (
        <Link
          to={`/shop/collection/${collectionSlug}`}
          className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
        >
          {collectionName} Collection
        </Link>
      )}

      {/* Name */}
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
        {name}
      </h1>

      {/* Price */}
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

      {/* Short description */}
      {shortDescription && (
        <p className="text-base leading-relaxed text-muted-foreground">
          {shortDescription}
        </p>
      )}

      {/* Variant selector */}
      {hasVariants && (
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
        <div className="flex flex-col sm:flex-row gap-3">
          <QuantityInput
            value={quantity}
            onChange={setQuantity}
            disabled={isAdding}
            className="shrink-0"
          />
          <Button 
            className="flex-1 h-14 px-8 text-base"
            onClick={handleAddToCart}
            disabled={!canAddToCart || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : justAdded ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" />
                {hasVariants && !selectedVariantId ? "Select an option" : "Add to Cart"}
              </>
            )}
          </Button>
        </div>
        <Button 
          variant="outline"
          className="w-full h-14 px-8 text-base sm:w-auto"
          onClick={toggleFavorite}
          disabled={isToggling}
        >
          <Heart className={cn("mr-2 h-5 w-5", isFavorited && "fill-primary text-primary")} />
          {isFavorited ? "In Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      {/* Specs */}
      <div className="pt-6 border-t border-border">
        <ProductSpecs
          metalType={metalType}
          metalWeight={metalWeight}
          grossWeight={grossWeight}
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
