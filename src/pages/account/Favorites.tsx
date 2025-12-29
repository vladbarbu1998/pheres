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
    <AccountLayout title="Favorites" description="Your saved items" isLoading={isLoading}>
      {isError ? (
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
            const product = favorite.products as any;
            if (!product) return null;

            const primaryImage = product.product_images?.find((img: any) => img.is_primary);
            const firstImage = product.product_images?.[0];
            const imageUrl = primaryImage?.image_url || firstImage?.image_url;
            const categorySlug = product.categories?.slug;
            const productUrl = categorySlug 
              ? `/shop/${categorySlug}/${product.slug}` 
              : `/shop/all/${product.slug}`;

            return (
              <div key={favorite.id} className="group relative">
                {/* Mobile: Horizontal card layout */}
                <div className="flex gap-4 sm:hidden">
                  <Link to={productUrl} className="shrink-0">
                    <div className="relative h-28 w-24 overflow-hidden rounded-sm bg-secondary/50">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="font-display text-xs text-muted-foreground/50">
                            PHERES
                          </span>
                        </div>
                      )}
                      {product.is_new && (
                        <span className="absolute left-1.5 top-1.5 bg-foreground px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-background">
                          NEW
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col justify-center py-1">
                    <Link to={productUrl}>
                      <h3 className="font-display text-sm font-medium text-foreground line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        ${Number(product.base_price).toLocaleString()}
                      </span>
                      {product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price) && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${Number(product.compare_at_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-8 w-fit gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => removeMutation.mutate(favorite.id)}
                      disabled={removeMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Desktop: Vertical card layout */}
                <div className="hidden sm:block">
                  <Link to={productUrl} className="block">
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
                    <Link to={productUrl}>
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
              </div>
            );
          })}
        </div>
      )}
    </AccountLayout>
  );
}
