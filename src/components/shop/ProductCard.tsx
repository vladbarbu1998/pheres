import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  collectionName?: string | null;
  isNew?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  imageUrl,
  collectionName,
  isNew,
  className,
  style,
}: ProductCardProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <article className={cn("group relative", className)} style={style}>
      {/* Image container */}
      <Link to={`/product/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary/50">
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
              <span className="bg-foreground px-2 py-1 text-xs font-medium tracking-wide text-background">
                NEW
              </span>
            )}
            {hasDiscount && (
              <span className="bg-primary px-2 py-1 text-xs font-medium tracking-wide text-primary-foreground">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3 h-9 w-9 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      {/* Details */}
      <div className="mt-4 space-y-1">
        {collectionName && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {collectionName}
          </p>
        )}
        <Link to={`/product/${slug}`}>
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
  );
}
