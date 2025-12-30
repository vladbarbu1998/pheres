import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

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

  // Keyboard navigation for main carousel (when lightbox is closed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) {
        if (e.key === "ArrowLeft") {
          emblaApi?.scrollPrev();
        } else if (e.key === "ArrowRight") {
          emblaApi?.scrollNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [emblaApi, lightboxOpen]);

  // Prepare slides for lightbox
  const lightboxSlides = sortedImages.map((image, index) => ({
    src: image.image_url,
    alt: image.alt_text || `${productName} - Image ${index + 1}`,
  }));

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square w-full bg-secondary/50 flex items-center justify-center">
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
                  className="relative aspect-square flex-[0_0_100%] min-w-0 bg-secondary/30"
                >
                  <button
                    onClick={() => {
                      setSelectedIndex(index);
                      setLightboxOpen(true);
                    }}
                    className="w-full h-full cursor-zoom-in"
                    aria-label="Open image gallery"
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${productName} - Image ${index + 1}`}
                      className="h-full w-full object-cover object-center"
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

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 w-full">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => scrollTo(index)}
                  onDoubleClick={() => {
                    scrollTo(index);
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
          </div>
        )}
      </div>

      {/* Lightbox - using yet-another-react-lightbox for consistent behavior */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={selectedIndex}
        slides={lightboxSlides}
        plugins={[Zoom, Thumbnails]}
        on={{
          view: ({ index }) => {
            setSelectedIndex(index);
            emblaApi?.scrollTo(index);
          },
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
        }}
        carousel={{
          finite: !hasMultipleImages,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
      />
    </>
  );
}

export function ProductGallerySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-square w-full" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}
