import { Layout } from "@/components/layout/Layout";
import { usePublishedPress } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink, Award, Crown, Star, Sparkles, Calendar } from "lucide-react";
import { format } from "date-fns";

// Static recognition/awards data
const recognitions = [
  {
    icon: Award,
    title: "Forbes Recognition",
    description: "Named among the most influential women in international business",
  },
  {
    icon: Crown,
    title: "Royal Appointment",
    description: "Official jewelry supplier to Princess Olga Romanoff",
  },
  {
    icon: Star,
    title: "Hong Kong's Most Powerful",
    description: "Featured in the \"300 Most Powerful People in Hong Kong\"",
  },
  {
    icon: Sparkles,
    title: "Mastercard Priceless",
    description: "Selected partner for exclusive Mastercard Priceless experiences",
  },
];

export default function Press() {
  const { data: pressEntries, isLoading, isError, refetch } = usePublishedPress();

  // Separate celebrity appearances from other press
  const celebrityEntries = pressEntries?.filter((entry) => entry.celebrity_name) || [];
  const pressArticles = pressEntries?.filter((entry) => !entry.celebrity_name && entry.external_link) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40">
        <div className="container max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
            Red Carpet & Recognition
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in text-balance">
            Pheres on the World Stage
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "100ms" }}>
            From the Oscars to the Golden Globes, Pheres jewelry has adorned some of 
            the world's most celebrated figures on the most prestigious stages.
          </p>
        </div>
      </section>

      {/* Celebrities Section */}
      <section className="border-t border-border/50 py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="mb-12 md:mb-16">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Celebrity Moments
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Worn by icons who understand that true luxury speaks for itself.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-muted-foreground">Unable to load press entries.</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : celebrityEntries.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-lg">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Celebrity appearances coming soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {celebrityEntries.map((entry, index) => (
                <article 
                  key={entry.id} 
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-muted mb-4">
                    {entry.image_url ? (
                      <img
                        src={entry.image_url}
                        alt={`${entry.celebrity_name} at ${entry.event_name || "event"}`}
                        className="h-full w-full object-cover transition-luxury group-hover:scale-105"
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
          )}
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="bg-card py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Awards & Recognition
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Global acknowledgment of exceptional craftsmanship and visionary leadership.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recognitions.map((item, index) => (
              <div 
                key={item.title}
                className="group p-6 bg-background border border-border rounded-lg text-center animate-fade-in hover:border-primary/30 transition-luxury"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-luxury group-hover:bg-primary/20">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Articles Section */}
      {pressArticles.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="mb-12 md:mb-16 text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                In the Press
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Featured coverage and notable mentions from around the world.
              </p>
            </div>

            <div className="space-y-4">
              {pressArticles.map((article, index) => (
                <a
                  key={article.id}
                  href={article.external_link!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-6 border border-border rounded-lg transition-luxury hover:border-primary/30 hover:bg-accent/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {article.description}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="ml-4 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="border-t border-border/50 py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Experience the Collection
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Discover the pieces that have graced the world's most prestigious stages.
          </p>
          <div className="mt-8">
            <a
              href="/shop"
              className="inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-luxury hover:bg-primary/90"
            >
              Explore the Collection
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
