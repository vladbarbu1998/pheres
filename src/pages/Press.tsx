import { Layout } from "@/components/layout/Layout";
import { usePressArticles } from "@/hooks/usePress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExternalLink, Award, Crown, Star, Sparkles, ArrowRight, Newspaper } from "lucide-react";

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
  const { data: pressArticles, isLoading, isError, refetch } = usePressArticles();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40">
        <div className="container max-w-4xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
            Media & Recognition
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl animate-fade-in text-balance">
            Press & Awards
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl animate-fade-in" style={{ animationDelay: "100ms" }}>
            Global acknowledgment of exceptional craftsmanship, visionary leadership, 
            and the art of creating truly extraordinary jewelry.
          </p>
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="border-t border-border/50 bg-card py-16 md:py-24">
        <div className="container max-w-6xl">
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Awards & Recognition
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Honors that reflect our commitment to excellence and innovation.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recognitions.map((item, index) => (
              <div 
                key={item.title}
                className="group p-6 bg-background border border-border rounded-sm text-center animate-fade-in hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary/20">
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

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Unable to load press articles.</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : pressArticles && pressArticles.length > 0 ? (
            <div className="space-y-4">
              {pressArticles.map((article, index) => (
                <a
                  key={article.id}
                  href={article.external_link!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-6 border border-border rounded-sm transition-all duration-300 hover:border-primary/30 hover:bg-accent/50 animate-fade-in"
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
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-sm">
              <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Press Coverage Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're compiling our media features and press coverage. 
                Check back soon for the latest news about Pheres.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-secondary/30 py-16 md:py-20">
        <div className="container max-w-3xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            See Who Wears Pheres
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Discover the icons who have chosen Pheres for the world's most celebrated events.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/celebrities">
                View Celebrities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/shop">Explore Collection</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
