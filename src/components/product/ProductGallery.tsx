import { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  // Sort images by display_order, with primary first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = sortedImages[selectedIndex];

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-secondary/50 flex items-center justify-center">
        <span className="font-display text-2xl text-muted-foreground/30">PHERES</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/30">
        <img
          src={selectedImage?.image_url}
          alt={selectedImage?.alt_text || productName}
          className="h-full w-full object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-20 w-20 flex-shrink-0 overflow-hidden bg-secondary/30 transition-all duration-200",
                selectedIndex === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `${productName} - Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductGallerySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-20 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}
