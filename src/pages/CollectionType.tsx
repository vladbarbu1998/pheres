import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { useCollectionsByType } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

type CollectionTypeParam = "couture" | "ready-to-wear";

const TYPE_CONFIG: Record<CollectionTypeParam, {
  dbType: "couture" | "ready_to_wear";
  title: string;
  overline: string;
  description: string;
}> = {
  couture: {
    dbType: "couture",
    title: "Couture",
    overline: "By Appointment",
    description: "Exceptional high jewelry, crafted with rare gemstones and unparalleled artistry for the most discerning collectors.",
  },
  "ready-to-wear": {
    dbType: "ready_to_wear",
    title: "Ready to Wear",
    overline: "Available Now",
    description: "Refined luxury jewelry, designed for everyday elegance and available for immediate discovery.",
  },
};

export default function CollectionTypePage() {
  const { type } = useParams<{ type: CollectionTypeParam }>();
  
  // Validate type parameter
  if (!type || !TYPE_CONFIG[type as CollectionTypeParam]) {
    return <Navigate to="/collections" replace />;
  }
  
  const config = TYPE_CONFIG[type as CollectionTypeParam];
  const { data: collections, isLoading, isError } = useCollectionsByType(config.dbType);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="border-b border-border bg-secondary/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            {/* Back link */}
            <Link 
              to="/collections" 
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              All Collections
            </Link>
            
            <p className="mb-3 font-label text-sm font-medium uppercase tracking-[0.3em] text-primary">
              {config.overline}
            </p>
            <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl">
              {config.title}
            </h1>
            <p className="mt-4 text-base text-muted-foreground lg:text-lg">
              {config.description}
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="container py-12 lg:py-20">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-sm">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-16 text-center">
            <p className="font-label text-sm tracking-wide text-muted-foreground">
              Unable to load collections. Please try again later.
            </p>
          </div>
        ) : collections && collections.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                to={`/shop/collection/${collection.slug}`}
                className="group block animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-sm bg-muted shadow-md transition-shadow duration-300 group-hover:shadow-xl">
                  {collection.image_url ? (
                    <img
                      src={collection.image_url}
                      alt={collection.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                      <span className="font-serif text-6xl font-light text-primary/20">
                        {collection.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
                  
                  {/* Text overlay on image */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h2 className="font-serif text-xl font-light tracking-wide text-white md:text-2xl">
                      {collection.name}
                    </h2>
                    <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-white/80 transition-all duration-300 group-hover:gap-3 group-hover:text-white">
                      View Pieces
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                
                {/* Description below image */}
                {collection.description && (
                  <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {collection.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="font-label text-sm tracking-wide text-muted-foreground">
              Collections coming soon. Check back for our curated worlds of wonder.
            </p>
          </div>
        )}
      </section>
    </Layout>
  );
}
