import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = sortedImages[selectedIndex];

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  }, [sortedImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  }, [sortedImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handlePrevious, handleNext]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    
    setTouchStart(null);
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-secondary/50 flex items-center justify-center">
        <span className="font-display text-2xl text-muted-foreground/30">PHERES</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-full">
        {/* Main image */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-[3/4] w-full max-w-full overflow-hidden bg-secondary/30 cursor-zoom-in group"
          aria-label="Open image gallery"
        >
          <img
            src={selectedImage?.image_url}
            alt={selectedImage?.alt_text || productName}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/10">
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-3">
              <ZoomIn className="h-5 w-5 text-foreground" />
            </div>
          </div>
        </button>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 w-full">
            {sortedImages.slice(0, 4).map((image, index) => (
              <button
                key={image.id}
                onClick={() => {
                  setSelectedIndex(index);
                }}
                onDoubleClick={() => {
                  setSelectedIndex(index);
                  setLightboxOpen(true);
                }}
                className={cn(
                  "relative aspect-square w-full overflow-hidden bg-secondary/30 transition-all duration-200",
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

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent 
          className="max-w-3xl max-h-[80vh] p-0 bg-background border overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <VisuallyHidden>
            <DialogTitle>{productName} - Image Gallery</DialogTitle>
          </VisuallyHidden>
          
          {/* Navigation buttons */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Main image */}
          <div className="flex items-center justify-center p-6">
            <img
              src={sortedImages[selectedIndex]?.image_url}
              alt={sortedImages[selectedIndex]?.alt_text || productName}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>

          {/* Thumbnails and counter at bottom */}
          {sortedImages.length > 1 && (
            <div className="border-t bg-muted/30 px-4 py-3 flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedIndex + 1} / {sortedImages.length}
              </span>
              <div className="flex gap-2 overflow-x-auto max-w-md">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "relative h-10 w-10 flex-shrink-0 overflow-hidden rounded transition-all duration-200",
                      selectedIndex === index
                        ? "ring-2 ring-primary"
                        : "opacity-60 hover:opacity-100"
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
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