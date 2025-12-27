import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductSpecs } from "./ProductSpecs";
import { Link } from "react-router-dom";

interface ProductInfoProps {
  name: string;
  price: number;
  compareAtPrice?: number | null;
  shortDescription?: string | null;
  collectionName?: string | null;
  collectionSlug?: string | null;
  metalType?: string | null;
  metalWeight?: string | null;
  stoneCarat?: string | null;
  stoneClarity?: string | null;
  stoneColor?: string | null;
  stoneCut?: string | null;
  stoneType?: string | null;
  certification?: string | null;
  isNew?: boolean;
}

export function ProductInfo({
  name,
  price,
  compareAtPrice,
  shortDescription,
  collectionName,
  collectionSlug,
  metalType,
  metalWeight,
  stoneCarat,
  stoneClarity,
  stoneColor,
  stoneCut,
  stoneType,
  certification,
  isNew,
}: ProductInfoProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

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
          ${price.toLocaleString()}
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

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
        <Button size="lg" variant="outline">
          <Heart className="mr-2 h-5 w-5" />
          Add to Wishlist
        </Button>
      </div>

      {/* Specs */}
      <div className="pt-6 border-t border-border">
        <ProductSpecs
          metalType={metalType}
          metalWeight={metalWeight}
          stoneCarat={stoneCarat}
          stoneClarity={stoneClarity}
          stoneColor={stoneColor}
          stoneCut={stoneCut}
          stoneType={stoneType}
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
