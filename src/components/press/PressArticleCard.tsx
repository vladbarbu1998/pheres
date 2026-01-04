import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
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
        {/* Thumbnail */}
        <div className="relative aspect-[2/1] overflow-hidden bg-muted">
          {article.thumbnail_url ? (
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              {article.outlet?.logo_url && (
                <img
                  src={article.outlet.logo_url}
                  alt={article.outlet.name}
                  className="h-6 w-auto max-w-[40%] object-contain opacity-20 grayscale"
                />
              )}
            </div>
          )}
          
          {/* Outlet badge - logo only */}
          {article.outlet?.logo_url && (
            <div className="absolute left-2 top-2 rounded-full bg-background/90 p-1.5 backdrop-blur-sm">
              <img
                src={article.outlet.logo_url}
                alt={article.outlet.name}
                className="h-3 w-auto object-contain"
              />
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* Date */}
          {article.publish_date && (
            <p className="mb-2 text-xs text-muted-foreground">
              {format(new Date(article.publish_date), "MMMM d, yyyy")}
            </p>
          )}

          {/* Title */}
          <h3 className="mb-2 font-display text-lg font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          {article.short_description && (
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
              {article.short_description}
            </p>
          )}

          {/* Read more link */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <span>Read Article</span>
            <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
