import { Link } from "react-router-dom";

interface SearchResultItemProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  collectionName?: string | null;
  categorySlug?: string | null;
  onClick?: () => void;
}

export function SearchResultItem({
  name,
  slug,
  price,
  imageUrl,
  collectionName,
  categorySlug,
  onClick,
}: SearchResultItemProps) {
  const productUrl = categorySlug ? `/shop/${categorySlug}/${slug}` : `/product/${slug}`;

  return (
    <Link
      to={productUrl}
      onClick={onClick}
      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors rounded-sm group"
    >
      {/* Thumbnail */}
      <div className="w-14 h-14 shrink-0 bg-muted rounded-sm overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {name}
        </p>
        {collectionName && (
          <p className="text-xs text-muted-foreground truncate">{collectionName}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        <p className="font-medium text-foreground">
          ${price.toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
