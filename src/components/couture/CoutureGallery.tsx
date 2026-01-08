import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

interface CoutureGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function CoutureGallery({ images, productName }: CoutureGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const currentImage = sortedImages[activeIndex];

  const goToImage = useCallback((index: number) => {
    if (index === activeIndex || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  }, [activeIndex, isTransitioning]);

  const goToPrev = useCallback(() => {
    const newIndex = activeIndex === 0 ? sortedImages.length - 1 : activeIndex - 1;
    goToImage(newIndex);
  }, [activeIndex, sortedImages.length, goToImage]);

  const goToNext = useCallback(() => {
    const newIndex = activeIndex === sortedImages.length - 1 ? 0 : activeIndex + 1;
    goToImage(newIndex);
  }, [activeIndex, sortedImages.length, goToImage]);

  const lightboxSlides = sortedImages.map((img) => ({
    src: img.image_url,
    alt: img.alt_text || productName,
  }));

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded-sm">
        <span className="text-muted-foreground text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Hero Image - 3:4 Portrait Ratio */}
      <div className="relative group">
        <div className="aspect-[3/4] overflow-hidden bg-stone-100 rounded-sm">
          <img
            src={currentImage?.image_url}
            alt={currentImage?.alt_text || productName}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 ease-out",
              "group-hover:scale-[1.02]",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
          />
        </div>

        {/* Navigation Arrows */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
          aria-label="View fullscreen"
        >
          <Expand className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Horizontal Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToImage(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-24 overflow-hidden rounded-sm transition-all duration-200",
                index === activeIndex
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "opacity-60 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `${productName} - View ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={activeIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
        animation={{ fade: 300, swipe: 300 }}
        carousel={{ finite: false }}
        controller={{ closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
        }}
      />
    </div>
  );
}

export function CoutureGallerySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-[3/4] bg-muted animate-pulse rounded-sm" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-20 h-24 bg-muted animate-pulse rounded-sm flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}
