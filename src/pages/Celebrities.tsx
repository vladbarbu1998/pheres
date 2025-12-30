import { useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { useCelebrityAppearances, type CelebrityAppearance } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Crown, ArrowRight, Search, X } from "lucide-react";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/useDebounce";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

function formatLocationYear(appearance: CelebrityAppearance): string | null {
  const parts: string[] = [];
  
  if (appearance.location) {
    parts.push(appearance.location);
  }
  
  if (appearance.event_date) {
    try {
      parts.push(format(new Date(appearance.event_date), "yyyy"));
    } catch {
      // Invalid date, skip
    }
  }
  
  return parts.length > 0 ? parts.join(", ") : null;
}

interface CelebrityCardProps {
  appearance: CelebrityAppearance;
  index: number;
  onImageClick: () => void;
}

function CelebrityCard({ appearance, index, onImageClick }: CelebrityCardProps) {
  const locationYear = formatLocationYear(appearance);

  return (
    <article 
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image container - clickable for lightbox */}
      <button
        type="button"
        onClick={onImageClick}
        className="w-full bg-background flex items-center justify-center cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-sm"
        aria-label={`View larger image of ${appearance.celebrity_name}`}
      >
        {appearance.image_url ? (
          <img
            src={appearance.image_url}
            alt={appearance.event_name 
              ? `${appearance.celebrity_name} at ${appearance.event_name}` 
              : appearance.celebrity_name || "Celebrity"
            }
            className="w-full h-auto max-h-[600px] object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.01]"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-secondary/30">
            <Crown className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </button>

      {/* Caption - not clickable */}
      <div className="mt-5">
        <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
          {appearance.celebrity_name}
        </h3>
        
        {appearance.event_name && (
          <p className="mt-1.5 font-display text-sm uppercase tracking-widest text-primary font-medium">
            {appearance.event_name}
          </p>
        )}
        
        {locationYear && (
          <p className="mt-0.5 text-sm text-muted-foreground font-light">
            {locationYear}
          </p>
        )}
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-10 md:gap-12 lg:gap-16 grid-cols-1 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="w-full aspect-square" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <Crown className="mx-auto h-14 w-14 text-muted-foreground/30 mb-5" />
      <h3 className="font-display text-xl font-medium text-foreground mb-3">
        Celebrity Moments Coming Soon
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
        We're curating our gallery of red carpet moments. Check back soon to see 
        icons wearing Pheres on the world's most prestigious stages.
      </p>
    </div>
  );
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-20">
      <Search className="mx-auto h-12 w-12 text-muted-foreground/30 mb-5" />
      <h3 className="font-display text-xl font-medium text-foreground mb-3">
        No Celebrity Moments Found
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
        We couldn't find any appearances matching your search. Try a different name, event, or year.
      </p>
      <Button variant="outline" onClick={onClear}>
        Clear Search
      </Button>
    </div>
  );
}

export default function Celebrities() {
  const { data: appearances, isLoading, isError, refetch } = useCelebrityAppearances();
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const debouncedQuery = useDebounce(searchQuery, 250);

  // Filter appearances based on search query
  const filteredAppearances = useMemo(() => {
    if (!appearances) return [];
    if (!debouncedQuery.trim()) return appearances;

    const query = debouncedQuery.toLowerCase().trim();
    
    return appearances.filter((appearance) => {
      const celebrityName = (appearance.celebrity_name || "").toLowerCase();
      const eventName = (appearance.event_name || "").toLowerCase();
      const location = (appearance.location || "").toLowerCase();
      const year = appearance.event_date 
        ? format(new Date(appearance.event_date), "yyyy") 
        : "";

      return (
        celebrityName.includes(query) ||
        eventName.includes(query) ||
        location.includes(query) ||
        year.includes(query)
      );
    });
  }, [appearances, debouncedQuery]);

  // Prepare slides for lightbox from filtered appearances (only those with images)
  const appearancesWithImages = useMemo(() => {
    return filteredAppearances.filter((a) => a.image_url);
  }, [filteredAppearances]);

  const lightboxSlides = useMemo(() => {
    return appearancesWithImages.map((appearance) => ({
      src: appearance.image_url!,
      alt: appearance.event_name 
        ? `${appearance.celebrity_name} at ${appearance.event_name}` 
        : appearance.celebrity_name || "Celebrity",
    }));
  }, [appearancesWithImages]);

  const openLightbox = useCallback((index: number) => {
    const appearance = filteredAppearances[index];
    if (appearance?.image_url) {
      const lightboxIdx = appearancesWithImages.findIndex((a) => a.id === appearance.id);
      setLightboxIndex(lightboxIdx);
    }
  }, [filteredAppearances, appearancesWithImages]);

  // Get current appearance for lightbox caption
  const currentLightboxAppearance = lightboxIndex >= 0 ? appearancesWithImages[lightboxIndex] : null;

  const hasAppearances = appearances && appearances.length > 0;
  const hasFilteredResults = filteredAppearances.length > 0;
  const isSearching = debouncedQuery.trim().length > 0;

  const clearSearch = () => setSearchQuery("");

  return (
    <Layout>
      <PageHero
        label="Worn by Icons"
        title="Celebrities & Red Carpet Moments"
        intro="Pheres jewelry has adorned some of the world's most celebrated figures on the most prestigious stages."
      />

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Gallery Grid - directly after hero, no section heading */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container max-w-5xl">
          {/* Search Input */}
          {hasAppearances && !isLoading && (
            <div className="mb-10 md:mb-12">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by name, event or year"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background border-border/60 focus-visible:ring-primary/20"
                  aria-label="Search celebrity appearances"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {isSearching && hasFilteredResults && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Showing {filteredAppearances.length} of {appearances.length} appearances
                </p>
              )}
            </div>
          )}

          {isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Unable to load celebrity moments.</p>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : hasAppearances ? (
            hasFilteredResults ? (
              <div className="grid gap-10 md:gap-12 lg:gap-16 grid-cols-1 md:grid-cols-2">
                {filteredAppearances.map((appearance, index) => (
                  <CelebrityCard 
                    key={appearance.id} 
                    appearance={appearance} 
                    index={index}
                    onImageClick={() => openLightbox(index)}
                  />
                ))}
              </div>
            ) : (
              <NoResultsState onClear={clearSearch} />
            )
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      {/* Subtle Shop Link */}
      {hasAppearances && (
        <section className="border-t border-border/40 py-16 md:py-20">
          <div className="container max-w-3xl text-center">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Experience the Collection
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Discover the pieces that have graced the world's most prestigious stages.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/shop">
                  Explore the Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          zoomInMultiplier: 2,
        }}
        carousel={{
          finite: false,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
        }}
        render={{
          slideFooter: () => {
            if (!currentLightboxAppearance) return null;
            return (
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center bg-gradient-to-t from-black/60 to-transparent">
                {currentLightboxAppearance.celebrity_name && (
                  <p className="font-display text-lg font-semibold text-white">
                    {currentLightboxAppearance.celebrity_name}
                  </p>
                )}
                {currentLightboxAppearance.event_name && (
                  <p className="text-sm text-white/80 mt-1">
                    {currentLightboxAppearance.event_name}
                  </p>
                )}
              </div>
            );
          },
        }}
      />
    </Layout>
  );
}
