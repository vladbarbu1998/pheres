import { Layout } from "@/components/layout/Layout";
import { useCelebrityAppearances, type GroupedCelebrities, type CelebrityAppearance } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const SECTION_TITLES: Record<string, string> = {
  "Red Carpet": "Red Carpet Highlights",
  "Magazine Cover": "Magazine Covers",
  "Special Appearance": "Special Appearances",
  "Other Appearances": "More Moments",
};

function formatEventInfo(appearance: CelebrityAppearance): string | null {
  const parts: string[] = [];
  
  if (appearance.event_name) {
    parts.push(appearance.event_name);
  }
  
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
  const eventInfo = formatEventInfo(appearance);

  return (
    <article 
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Elegant framed image */}
      <div className="bg-secondary/30 p-3 md:p-4 rounded-sm">
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          {appearance.image_url ? (
            <img
              src={appearance.image_url}
              alt={appearance.event_name 
                ? `${appearance.celebrity_name} at ${appearance.event_name}` 
                : appearance.celebrity_name || "Celebrity"
              }
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Crown className="h-12 w-12 text-primary/20" />
            </div>
          )}
        </div>
      </div>

      {/* Minimal caption */}
      <div className="mt-4 px-1">
        <h3 className="font-display text-lg font-semibold text-foreground tracking-tight">
          {appearance.celebrity_name}
        </h3>
        
        {eventInfo && (
          <p className="mt-1 text-sm text-muted-foreground">
            {eventInfo}
          </p>
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
      <div className="mb-10 md:mb-12">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          {title}
        </h2>
        <div className="mt-3 h-px w-16 bg-primary/60" />
      </div>

      {/* Responsive Grid */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="space-y-16">
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <div key={sectionIdx}>
          <Skeleton className="h-8 w-48 mb-10" />
          <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="bg-secondary/30 p-3 md:p-4 rounded-sm">
                  <Skeleton className="aspect-[4/5] w-full" />
                </div>
                <div className="mt-4 px-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
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
            <div className="space-y-20 md:space-y-24">
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
