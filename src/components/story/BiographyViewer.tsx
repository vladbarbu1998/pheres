import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
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

  return (
    <div ref={containerRef} className="w-full">
      {isVisible ? (
        <div className="relative">
          {/* Book Viewer Container */}
          <div className="relative mx-auto max-w-4xl">
            {/* Shadow/Book effect wrapper */}
            <div className="relative rounded-sm bg-card shadow-2xl shadow-foreground/5">
              {/* Page display area */}
              <div className="relative w-full overflow-hidden bg-background sm:aspect-[4/3] md:aspect-[16/10]">
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
                  className="absolute bottom-4 right-4 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-background hover:scale-105"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Controls bar */}
              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                {/* Mobile navigation */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  disabled={currentPage === 0}
                  className="md:hidden"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous</span>
                </Button>

                {/* Page indicator */}
                <div className="flex flex-1 items-center justify-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1} of {TOTAL_PAGES}
                  </span>
                </div>

                {/* Mobile navigation */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  disabled={currentPage === TOTAL_PAGES - 1}
                  className="md:hidden"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next</span>
                </Button>
              </div>

              {/* Page thumbnails - horizontal scroll on mobile */}
              <div className="border-t border-border/50 px-4 py-3">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
                  {pages.map((page, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsLoaded(false);
                        setCurrentPage(index);
                      }}
                      className={cn(
                        "relative flex-shrink-0 overflow-hidden rounded-sm transition-all",
                        currentPage === index
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "opacity-60 hover:opacity-100"
                      )}
                      aria-label={`Go to page ${index + 1}`}
                    >
                      <img
                        src={page.src}
                        alt=""
                        className="h-12 w-auto object-cover sm:h-16"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Download link */}
          <div className="mt-6 flex justify-center">
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Download className="h-4 w-4" />
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
