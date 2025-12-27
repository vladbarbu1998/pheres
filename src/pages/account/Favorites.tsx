import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useAccount";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { data: favorites, isLoading, isError, refetch } = useFavorites();
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase.from("favorites").delete().eq("id", favoriteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to remove from favorites");
    },
  });

  return (
    <AccountLayout title="Favorites" description="Your saved items">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Something went wrong loading your favorites.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : favorites?.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold">No favorites yet</h3>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            Browse our collection and save your favorite pieces here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/shop">Browse Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites?.map((favorite) => {
            const product = favorite.products;
            if (!product) return null;

            const primaryImage = product.product_images?.find((img) => img.is_primary);
            const firstImage = product.product_images?.[0];
            const imageUrl = primaryImage?.image_url || firstImage?.image_url;

            return (
              <div key={favorite.id} className="group relative">
                <Link to={`/product/${product.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary/50">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display text-lg text-muted-foreground/50">
                          PHERES
                        </span>
                      </div>
                    )}
                    {product.is_new && (
                      <span className="absolute left-3 top-3 bg-foreground px-2 py-1 text-xs font-medium tracking-wide text-background">
                        NEW
                      </span>
                    )}
                  </div>
                </Link>

                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-3 top-3 h-9 w-9"
                  onClick={() => removeMutation.mutate(favorite.id)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="mt-4 space-y-1">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-display text-sm font-medium text-foreground transition-colors hover:text-primary lg:text-base">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      ${Number(product.base_price).toLocaleString()}
                    </span>
                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price) && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${Number(product.compare_at_price).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
