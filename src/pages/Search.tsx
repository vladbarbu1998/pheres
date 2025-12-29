import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchProducts } from "@/hooks/useSearch";
import { useState, useEffect } from "react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(queryParam);

  const { data, isLoading, isError, refetch } = useSearchProducts(queryParam);

  useEffect(() => {
    setInputValue(queryParam);
  }, [queryParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    }
  };

  const products = data || [];

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Back link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        {/* Search header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl mb-4">
            Search
          </h1>
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search for jewelry..."
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Results */}
        {queryParam ? (
          <>
            <p className="text-muted-foreground mb-6">
              {isLoading ? (
                "Searching..."
              ) : products.length > 0 ? (
                <>
                  Found <span className="text-foreground font-medium">{products.length}</span> result{products.length !== 1 ? "s" : ""} for "{queryParam}"
                </>
              ) : (
                <>No results for "{queryParam}"</>
              )}
            </p>

            {isError ? (
              <div className="text-center py-16 border border-dashed border-border rounded-sm">
                <p className="text-muted-foreground mb-4">Something went wrong while searching.</p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} isLoading={isLoading} />
            ) : !isLoading ? (
              <div className="text-center py-16 border border-dashed border-border rounded-sm">
                <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-display text-lg font-medium text-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any products matching "{queryParam}". 
                  Try a different search term or browse our collections.
                </p>
                <Button asChild variant="outline">
                  <Link to="/shop">Browse All Products</Link>
                </Button>
              </div>
            ) : (
              <ProductGrid products={[]} isLoading={true} skeletonCount={8} />
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-border rounded-sm">
            <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-lg font-medium text-foreground mb-2">
              Start your search
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a search term above to find jewelry pieces by name, 
              collection, or description.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
