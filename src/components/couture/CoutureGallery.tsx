import { useState } from "react";
import { Expand } from "lucide-react";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const lightboxSlides = sortedImages.map((img) => ({
    src: img.image_url,
    alt: img.alt_text || productName,
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-[3/4] bg-muted flex items-center justify-center rounded-sm">
        <span className="text-muted-foreground text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Vertically stacked images */}
      {sortedImages.map((image, index) => (
        <div
          key={image.id}
          className="relative group cursor-pointer"
          onClick={() => openLightbox(index)}
        >
          <div className="overflow-hidden bg-stone-100 rounded-sm">
            <img
              src={image.image_url}
              alt={image.alt_text || `${productName} - View ${index + 1}`}
              className={cn(
                "w-full h-auto object-contain transition-transform duration-500 ease-out",
                "group-hover:scale-[1.02]"
              )}
            />
          </div>

          {/* Fullscreen Button - appears on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(index);
            }}
            className="absolute bottom-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            aria-label="View fullscreen"
          >
            <Expand className="h-5 w-5 text-foreground" />
          </button>
        </div>
      ))}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
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
    <div className="flex flex-col gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-sm" />
      ))}
    </div>
  );
}
