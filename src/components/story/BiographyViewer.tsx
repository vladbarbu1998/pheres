import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const TOTAL_PAGES = 25;
const PDF_URL = "/documents/narcisa-pheres-bio-2025.pdf";

// Generate page image paths
const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => ({
  src: `/documents/bio-pages/page-${i + 1}.jpg`,
  alt: `Designer Biography - Page ${i + 1}`,
}));

export function BiographyViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  // Lazy load - only render when section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-scroll thumbnails to keep active one in view
  useEffect(() => {
    if (activeThumbnailRef.current && thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const thumbnail = activeThumbnailRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const thumbnailRect = thumbnail.getBoundingClientRect();
      
      // Calculate scroll position to center the thumbnail
      const scrollLeft = thumbnail.offsetLeft - container.offsetWidth / 2 + thumbnail.offsetWidth / 2;
      
      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  const goToPrevious = useCallback(() => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev < TOTAL_PAGES - 1 ? prev + 1 : prev));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Touch/drag scroll for thumbnails
  useEffect(() => {
    const container = thumbnailsRef.current;
    if (!container) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      container.style.cursor = "grabbing";
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      container.style.cursor = "grab";
    };

    const handleMouseUp = () => {
      isDown = false;
      container.style.cursor = "grab";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible]);

  return (
    <div ref={containerRef} className="w-full">
      {isVisible ? (
        <div className="relative">
          {/* Book Viewer Container */}
          <div className="relative mx-auto max-w-4xl">
            {/* Shadow/Book effect wrapper */}
            <div className="relative overflow-hidden rounded-sm bg-card shadow-2xl shadow-foreground/5">
              {/* Page display area */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-background sm:aspect-[4/3] md:aspect-[16/10]">
                {/* Current page image */}
                <img
                  src={pages[currentPage].src}
                  alt={pages[currentPage].alt}
                  className={cn(
                    "h-full w-full object-contain transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setIsLoaded(true)}
                  loading="lazy"
                />
                
                {/* Loading skeleton */}
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}

                {/* Navigation overlays - hidden on mobile, shown on larger screens */}
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 0}
                  className="absolute left-0 top-0 hidden h-full w-1/4 cursor-pointer opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed md:block"
                  aria-label="Previous page"
                >
                  <div className="flex h-full items-center justify-start pl-4">
                    <div className="rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm">
                      <ChevronLeft className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={goToNext}
                  disabled={currentPage === TOTAL_PAGES - 1}
                  className="absolute right-0 top-0 hidden h-full w-1/4 cursor-pointer opacity-0 transition-opacity hover:opacity-100 disabled:cursor-not-allowed md:block"
                  aria-label="Next page"
                >
                  <div className="flex h-full items-center justify-end pr-4">
                    <div className="rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm">
                      <ChevronRight className="h-6 w-6 text-foreground" />
                    </div>
                  </div>
                </button>

                {/* Zoom button */}
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-2 right-2 rounded-full bg-background/80 p-1.5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-background sm:bottom-4 sm:right-4 sm:p-2"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4 text-foreground sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Controls bar - compact on mobile */}
              <div className="flex items-center justify-between border-t border-border/50 px-2 py-1.5 sm:px-4 sm:py-2 md:py-3">
                {/* Mobile navigation */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentPage === 0}
                  className="h-8 w-8 p-0 md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>

                {/* Page indicator */}
                <div className="flex flex-1 items-center justify-center">
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {currentPage + 1} / {TOTAL_PAGES}
                  </span>
                </div>

                {/* Mobile navigation */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentPage === TOTAL_PAGES - 1}
                  className="h-8 w-8 p-0 md:hidden"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>

              {/* Page thumbnails - swipeable carousel */}
              <div className="border-t border-border/50 px-2 py-2 sm:px-4 sm:py-3">
                <div 
                  ref={thumbnailsRef}
                  className="flex cursor-grab gap-1.5 overflow-x-auto scroll-smooth sm:gap-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {pages.map((page, index) => (
                    <button
                      key={index}
                      ref={currentPage === index ? activeThumbnailRef : null}
                      onClick={() => {
                        setIsLoaded(false);
                        setCurrentPage(index);
                      }}
                      className={cn(
                        "relative flex-shrink-0 overflow-hidden rounded-sm transition-all duration-200",
                        currentPage === index
                          ? "ring-2 ring-primary ring-offset-1 ring-offset-background sm:ring-offset-2"
                          : "opacity-50 hover:opacity-80"
                      )}
                      aria-label={`Go to page ${index + 1}`}
                    >
                      <img
                        src={page.src}
                        alt=""
                        className="h-10 w-auto object-cover sm:h-14 md:h-16"
                        loading="lazy"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Download link - reduced top margin on mobile */}
          <div className="mt-3 flex justify-center sm:mt-4 md:mt-6">
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Download full biography (PDF)
            </a>
          </div>

          {/* Lightbox for zoomed view */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={currentPage}
            slides={pages}
            plugins={[Zoom]}
            on={{
              view: ({ index }) => setCurrentPage(index),
            }}
            carousel={{ finite: true }}
            controller={{ closeOnBackdropClick: true }}
            styles={{
              container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
            }}
          />
        </div>
      ) : (
        // Placeholder while not visible (maintains layout)
        <div className="mx-auto aspect-[4/3] max-w-4xl animate-pulse rounded-sm bg-muted/30 md:aspect-[16/10]" />
      )}
    </div>
  );
}
