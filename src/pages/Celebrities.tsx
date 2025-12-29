import { Layout } from "@/components/layout/Layout";
import { useCelebrityEntries } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Star, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Celebrities() {
  const { data: celebrityEntries, isLoading, isError, refetch } = useCelebrityEntries();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40">
        <div className="container max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
            Red Carpet Moments
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in text-balance">
            Worn by Icons
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "100ms" }}>
            From the Oscars to the Golden Globes, Pheres jewelry has adorned some of 
            the world's most celebrated figures on the most prestigious stages.
          </p>
        </div>
      </section>

      {/* Celebrities Grid */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="container max-w-6xl">
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load celebrity moments.</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : celebrityEntries && celebrityEntries.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {celebrityEntries.map((entry, index) => (
                <article 
                  key={entry.id} 
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-muted mb-4 rounded-sm">
                    {entry.image_url ? (
                      <img
                        src={entry.image_url}
                        alt={`${entry.celebrity_name} at ${entry.event_name || "event"}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Star className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {entry.celebrity_name}
                    </h3>
                    {entry.event_name && (
                      <p className="text-sm text-primary font-medium">
                        {entry.event_name}
                      </p>
                    )}
                    {entry.event_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(entry.event_date), "MMMM yyyy")}
                      </p>
                    )}
                    {entry.description && (
                      <p className="text-sm text-muted-foreground pt-2 leading-relaxed">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-sm">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Celebrity Moments Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're curating our gallery of red carpet moments. Check back soon to see 
                icons wearing Pheres on the world's most prestigious stages.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-secondary/30 py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Experience the Collection
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Discover the pieces that have graced the world's most prestigious stages.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/shop">
                Explore the Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/celebrities">View Celebrities</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
