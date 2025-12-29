import { Layout } from "@/components/layout/Layout";
import { useCelebrityAppearances, type GroupedCelebrities, type CelebrityAppearance } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, ArrowRight, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

const SECTION_TITLES: Record<string, string> = {
  "Red Carpet": "Red Carpet Highlights",
  "Magazine Cover": "Magazine Covers",
  "Special Appearance": "Special Appearances",
  "Other Appearances": "More Moments",
};

function CelebrityCard({ appearance, index }: { appearance: CelebrityAppearance; index: number }) {
  const hasJewelryPhoto = !!appearance.jewelry_photo_url;
  const hasEventName = !!appearance.event_name;
  const hasEventDate = !!appearance.event_date;
  const hasLocation = !!appearance.location;
  const hasMetadata = hasEventDate || hasLocation;

  return (
    <article 
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Photos layout - adapts based on whether jewelry photo exists */}
      <div className={`flex flex-col ${hasJewelryPhoto ? 'md:flex-row gap-4 md:gap-6' : ''}`}>
        {/* Celebrity Photo */}
        <div className={hasJewelryPhoto ? 'w-full md:w-2/3' : 'w-full'}>
          <div className="aspect-[3/4] overflow-hidden bg-muted rounded-sm">
            {appearance.image_url ? (
              <img
                src={appearance.image_url}
                alt={appearance.event_name 
                  ? `${appearance.celebrity_name} at ${appearance.event_name}` 
                  : appearance.celebrity_name || "Celebrity"
                }
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <Crown className="h-16 w-16 text-primary/20" />
              </div>
            )}
          </div>
        </div>

        {/* Jewelry Photo - Only render if present */}
        {hasJewelryPhoto && (
          <div className="w-full md:w-1/3 md:flex md:items-center">
            <div className="aspect-square overflow-hidden bg-muted rounded-sm w-full">
              <img
                src={appearance.jewelry_photo_url!}
                alt={`Jewelry worn by ${appearance.celebrity_name}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Caption - only show fields that have values */}
      <div className="mt-5">
        <h3 className="font-display text-xl font-semibold text-foreground tracking-tight">
          {appearance.celebrity_name}
        </h3>
        
        {hasEventName && (
          <p className="mt-1 text-base text-primary font-medium">
            {appearance.event_name}
          </p>
        )}
        
        {hasMetadata && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {hasEventDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(appearance.event_date!), "MMMM yyyy")}
              </span>
            )}
            {hasLocation && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {appearance.location}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function CelebritySection({ group, sectionIndex }: { group: GroupedCelebrities; sectionIndex: number }) {
  const title = SECTION_TITLES[group.section] || group.section;
  
  return (
    <section 
      className="animate-fade-in"
      style={{ animationDelay: `${sectionIndex * 100}ms` }}
    >
      {/* Section Header */}
      <div className="mb-10 md:mb-14">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        <div className="mt-3 h-px w-16 bg-primary/60" />
      </div>

      {/* Grid of Cards */}
      <div className="grid gap-12 md:gap-16 lg:grid-cols-2">
        {group.appearances.map((appearance, index) => (
          <CelebrityCard 
            key={appearance.id} 
            appearance={appearance} 
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-20">
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <div key={sectionIdx}>
          <Skeleton className="h-8 w-64 mb-10" />
          <div className="grid gap-12 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="aspect-[3/4] w-full md:w-2/3" />
                  <div className="w-full md:w-1/3 md:flex md:items-center">
                    <Skeleton className="aspect-square w-full" />
                  </div>
                </div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 border border-dashed border-border/60 rounded-sm">
      <Crown className="mx-auto h-14 w-14 text-muted-foreground/40 mb-5" />
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
  const { data: groupedAppearances, isLoading, isError, refetch } = useCelebrityAppearances();

  const hasAppearances = groupedAppearances && groupedAppearances.length > 0;

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

      {/* Main Content */}
      <section className="border-t border-border/40 py-16 md:py-24">
        <div className="container max-w-6xl">
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
            <div className="space-y-20 md:space-y-28">
              {groupedAppearances.map((group, sectionIndex) => (
                <CelebritySection 
                  key={group.section} 
                  group={group} 
                  sectionIndex={sectionIndex}
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
