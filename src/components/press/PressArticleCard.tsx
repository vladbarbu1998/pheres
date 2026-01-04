import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import type { PressArticleWithOutlet } from "@/hooks/usePressArticles";

interface PressArticleCardProps {
  article: PressArticleWithOutlet;
}

export function PressArticleCard({ article }: PressArticleCardProps) {
  return (
    <a
      href={article.external_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/20">
        <div className="flex flex-col sm:flex-row">
          {/* Image - Left side */}
          <div className="relative w-full sm:w-2/5 flex-shrink-0">
            <div className="aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden bg-muted">
              {article.thumbnail_url ? (
                <img
                  src={article.thumbnail_url}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full min-h-[120px] w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  {article.outlet?.logo_url && (
                    <img
                      src={article.outlet.logo_url}
                      alt={article.outlet.name}
                      className="h-8 w-auto max-w-[60%] object-contain opacity-30 grayscale"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content - Right side */}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div>
              {/* Outlet logo + date row */}
              <div className="mb-3 flex items-center gap-3">
                {article.outlet?.logo_url && (
                  <img
                    src={article.outlet.logo_url}
                    alt={article.outlet.name}
                    className="h-5 w-auto object-contain"
                  />
                )}
                {article.publish_date && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(article.publish_date), "MMM d, yyyy")}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 className="mb-2 font-display text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>

              {/* Description */}
              {article.short_description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.short_description}
                </p>
              )}
            </div>

            {/* Read more link */}
            <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary">
              <span>Read Article</span>
              <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </Card>
    </a>
  );
}
