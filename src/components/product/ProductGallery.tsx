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
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-[3/4] w-full overflow-hidden bg-secondary/30 cursor-zoom-in group"
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
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sortedImages.map((image, index) => (
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

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-background/95 backdrop-blur-md border-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <VisuallyHidden>
            <DialogTitle>{productName} - Image Gallery</DialogTitle>
          </VisuallyHidden>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Navigation buttons */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Main image */}
          <div className="flex items-center justify-center h-full p-8 md:p-16">
            <img
              src={sortedImages[selectedIndex]?.image_url}
              alt={sortedImages[selectedIndex]?.alt_text || productName}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Thumbnails at bottom */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg max-w-[90vw] overflow-x-auto">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded transition-all duration-200",
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
          )}

          {/* Image counter */}
          {sortedImages.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-medium bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
              {selectedIndex + 1} / {sortedImages.length}
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