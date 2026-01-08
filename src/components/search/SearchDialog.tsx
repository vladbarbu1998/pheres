import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebouncedSearch } from "@/hooks/useSearch";
import { SearchResultItem } from "./SearchResultItem";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const { query, setQuery, debouncedQuery, data, isLoading } = useDebouncedSearch("", 250);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open, setQuery]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      onOpenChange(false);
      setQuery("");
    }
  }, [query, navigate, onOpenChange, setQuery]);

  const handleResultClick = useCallback(() => {
    onOpenChange(false);
    setQuery("");
  }, [onOpenChange, setQuery]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange]);

  const results = data || [];
  const showResults = debouncedQuery.trim().length > 0;
  const hasResults = results.length > 0;
  const displayedResults = results.slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[80vh] flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Search products</DialogTitle>
        </VisuallyHidden>
        
        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex items-center border-b border-border shrink-0">
          <Search className="ml-4 h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for jewelry..."
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        {/* Results area */}
        {showResults ? (
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                <p className="text-sm">Searching...</p>
              </div>
            ) : hasResults ? (
              <ScrollArea className="h-full max-h-[50vh]">
                <div className="p-2">
                  {displayedResults.map((product) => {
                    const primaryImage = product.product_images?.find((img) => img.is_primary);
                    const firstImage = product.product_images?.[0];
                    const imageUrl = primaryImage?.image_url || firstImage?.image_url || null;
                    const collectionName = product.product_collections?.[0]?.collections?.name || null;
                    const categorySlug = product.categories?.slug || null;
                    
                    // Check if couture product
                    const coutureCollection = product.product_collections?.find(
                      pc => pc.collections?.collection_type === "couture"
                    )?.collections;

                    return (
                      <SearchResultItem
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                        price={Number(product.base_price)}
                        imageUrl={imageUrl}
                        collectionName={collectionName}
                        categorySlug={categorySlug}
                        productType={product.product_type}
                        coutureCollectionSlug={coutureCollection?.slug}
                        isArchived={(product as any).archived === true}
                        onClick={handleResultClick}
                      />
                    );
                  })}
                </div>
                
                {results.length > 8 && (
                  <div className="p-3 border-t border-border text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSubmit}
                      className="text-primary hover:text-primary"
                    >
                      View all {results.length} results
                    </Button>
                  </div>
                )}
              </ScrollArea>
            ) : (
              <div className="p-6 text-center">
                <Search className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No products found for "{debouncedQuery}"
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    navigate("/shop");
                    onOpenChange(false);
                    setQuery("");
                  }}
                  className="text-primary"
                >
                  Browse all products
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Enter</kbd> to search
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
