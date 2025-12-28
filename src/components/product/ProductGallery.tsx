import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
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

  // Embla carousel for main image
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
  });

  // Embla carousel for lightbox
  const [lightboxEmblaRef, lightboxEmblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    startIndex: selectedIndex,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync lightbox carousel with main carousel when opened
  useEffect(() => {
    if (lightboxOpen && lightboxEmblaApi) {
      lightboxEmblaApi.scrollTo(selectedIndex, true);
    }
  }, [lightboxOpen, lightboxEmblaApi, selectedIndex]);

  // Sync lightbox selection back to main
  useEffect(() => {
    if (!lightboxEmblaApi) return;
    const onLightboxSelect = () => {
      const index = lightboxEmblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      emblaApi?.scrollTo(index);
    };
    lightboxEmblaApi.on("select", onLightboxSelect);
    return () => {
      lightboxEmblaApi.off("select", onLightboxSelect);
    };
  }, [lightboxEmblaApi, emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const lightboxScrollPrev = useCallback(() => {
    lightboxEmblaApi?.scrollPrev();
  }, [lightboxEmblaApi]);

  const lightboxScrollNext = useCallback(() => {
    lightboxEmblaApi?.scrollNext();
  }, [lightboxEmblaApi]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") {
          lightboxEmblaApi?.scrollPrev();
        } else if (e.key === "ArrowRight") {
          lightboxEmblaApi?.scrollNext();
        }
      } else {
        if (e.key === "ArrowLeft") {
          emblaApi?.scrollPrev();
        } else if (e.key === "ArrowRight") {
          emblaApi?.scrollNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi, lightboxEmblaApi, lightboxOpen]);

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-secondary/50 flex items-center justify-center">
        <span className="font-display text-2xl text-muted-foreground/30">PHERES</span>
      </div>
    );
  }

  const hasMultipleImages = sortedImages.length > 1;

  return (
    <>
      <div className="flex flex-col gap-4 w-full max-w-full">
        {/* Main image carousel */}
        <div className="relative w-full max-w-full overflow-hidden group">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {sortedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-[3/4] flex-[0_0_100%] min-w-0 bg-secondary/30"
                >
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="w-full h-full cursor-zoom-in"
                    aria-label="Open image gallery"
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${productName} - Image ${index + 1}`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/10 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-3">
              <ZoomIn className="h-5 w-5 text-foreground" />
            </div>
          </div>

          {/* Navigation arrows */}
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm transition-opacity",
                  !canScrollPrev && "opacity-40 cursor-not-allowed"
                )}
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm transition-opacity",
                  !canScrollNext && "opacity-40 cursor-not-allowed"
                )}
                onClick={scrollNext}
                disabled={!canScrollNext}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Counter + Thumbnails */}
        {hasMultipleImages && (
          <div className="flex flex-col gap-3">
            {/* Image counter */}
            <div className="flex justify-center">
              <span className="text-sm text-muted-foreground">
                {selectedIndex + 1} / {sortedImages.length}
              </span>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 w-full">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => scrollTo(index)}
                  onDoubleClick={() => {
                    scrollTo(index);
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
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0 bg-background border overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{productName} - Image Gallery</DialogTitle>
          </VisuallyHidden>

          {/* Lightbox carousel */}
          <div className="relative">
            <div ref={lightboxEmblaRef} className="overflow-hidden">
              <div className="flex">
                {sortedImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex-[0_0_100%] min-w-0 flex items-center justify-center p-6"
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${productName} - Image ${index + 1}`}
                      className="max-w-full max-h-[60vh] object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={lightboxScrollPrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={lightboxScrollNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnails and counter at bottom */}
          {hasMultipleImages && (
            <div className="border-t bg-muted/30 px-4 py-3 flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedIndex + 1} / {sortedImages.length}
              </span>
              <div className="flex gap-2 overflow-x-auto max-w-md">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => lightboxEmblaApi?.scrollTo(index)}
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
      <div className="flex justify-center">
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}
