import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/layout/PageHero";
import { PressLogoCarousel } from "@/components/press/PressLogoCarousel";
import { PressArticleCard } from "@/components/press/PressArticleCard";
import { usePressOutlets } from "@/hooks/usePressOutlets";
import { usePressArticles } from "@/hooks/usePressArticles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function PressPage() {
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  
  const { data: outlets, isLoading: outletsLoading } = usePressOutlets();
  const { data: articles, isLoading: articlesLoading } = usePressArticles();

  // Get outlets that have articles (for filter dropdown)
  const outletsWithArticles = useMemo(() => {
    if (!outlets || !articles) return [];
    const outletIdsWithArticles = new Set(articles.map(a => a.outlet_id));
    return outlets.filter(outlet => outletIdsWithArticles.has(outlet.id));
  }, [outlets, articles]);

  const filteredArticles = useMemo(() => {
    if (!articles) return [];
    if (!selectedOutletId) return articles;
    return articles.filter((article) => article.outlet_id === selectedOutletId);
  }, [articles, selectedOutletId]);

  const handleOutletSelect = (outletId: string) => {
    setSelectedOutletId(outletId === selectedOutletId ? null : outletId);
  };

  const handleFilterChange = (value: string) => {
    setSelectedOutletId(value === "all" ? null : value);
  };

  const isLoading = outletsLoading || articlesLoading;

  return (
    <Layout>
      <PageHero
        label="In the Spotlight"
        title="Press"
        intro="Pheres in the world's most prestigious publications and media. Discover our latest features, interviews, and editorial coverage."
      />

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Logo Carousel Section - Full width */}
      {!outletsLoading && outlets && outlets.length > 0 && (
        <section className="border-b border-border">
          <PressLogoCarousel outlets={outlets} />
        </section>
      )}

      {/* Articles Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          {/* Filter Controls */}
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                {selectedOutletId
                  ? `${outlets?.find((o) => o.id === selectedOutletId)?.name || "Outlet"} Articles`
                  : "All Press Coverage"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <Select
                value={selectedOutletId || "all"}
                onValueChange={handleFilterChange}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by outlet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  {outletsWithArticles.map((outlet) => (
                    <SelectItem key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Articles Grid */}
          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-lg border p-4">
                  <Skeleton className="h-28 w-28 flex-shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">
                {selectedOutletId
                  ? "No articles from this outlet yet."
                  : "No press articles yet. Check back soon!"}
              </p>
              {selectedOutletId && (
                <button
                  onClick={() => setSelectedOutletId(null)}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  View all articles
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredArticles.map((article) => (
                <PressArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
