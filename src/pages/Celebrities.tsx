import { Layout } from "@/components/layout/Layout";
import { useCelebrityAppearances, type CelebrityAppearance } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";
import { format } from "date-fns";

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

function CelebrityCard({ appearance, index }: { appearance: CelebrityAppearance; index: number }) {
  const locationYear = formatLocationYear(appearance);

  return (
    <article 
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image container - shows full image without cropping */}
      <div className="bg-background flex items-center justify-center">
        {appearance.image_url ? (
          <img
            src={appearance.image_url}
            alt={appearance.event_name 
              ? `${appearance.celebrity_name} at ${appearance.event_name}` 
              : appearance.celebrity_name || "Celebrity"
            }
            className="w-full h-auto max-h-[600px] object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.01]"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-secondary/30">
            <Crown className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="mt-5">
        <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
          {appearance.celebrity_name}
        </h3>
        
        {appearance.event_name && (
          <p className="mt-1 text-base text-primary font-medium">
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

export default function Celebrities() {
  const { data: appearances, isLoading, isError, refetch } = useCelebrityAppearances();

  const hasAppearances = appearances && appearances.length > 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-28 lg:py-36">
        <div className="container max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
            Worn by Icons
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in text-balance">
            Celebrities & Red Carpet Moments
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in leading-relaxed" style={{ animationDelay: "100ms" }}>
            From the Oscars to the Golden Globes, Pheres jewelry has adorned some of 
            the world's most celebrated figures on the most prestigious stages.
          </p>
        </div>
      </section>

      {/* Gallery Grid - directly after hero, no section heading */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container max-w-5xl">
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
            <div className="grid gap-10 md:gap-12 lg:gap-16 grid-cols-1 md:grid-cols-2">
              {appearances.map((appearance, index) => (
                <CelebrityCard 
                  key={appearance.id} 
                  appearance={appearance} 
                  index={index}
                />
              ))}
            </div>
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
    </Layout>
  );
}
