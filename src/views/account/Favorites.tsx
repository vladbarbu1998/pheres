"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useFavorites } from "@/hooks/useAccount";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Variant {
  id: string;
  name: string;
  price_adjustment: number;
  is_active: boolean;
}

export default function FavoritesPage() {
  const { data: favorites, isLoading, isError, refetch } = useFavorites();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showVariantDialog, setShowVariantDialog] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<{ id: string; name: string; price: number } | null>(null);

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

  const handleQuickAdd = async (productId: string, productName: string, productPrice: number) => {
    if (addingProductId) return;
    setAddingProductId(productId);

    try {
      const { data: variantsData, error } = await supabase
        .from("product_variants")
        .select("id, name, price_adjustment, is_active")
        .eq("product_id", productId)
        .eq("is_active", true);

      if (error) throw error;

      if (variantsData && variantsData.length > 0) {
        setVariants(variantsData);
        setSelectedVariantId(variantsData[0].id);
        setCurrentProduct({ id: productId, name: productName, price: productPrice });
        setShowVariantDialog(true);
      } else {
        await addItem(productId, null, 1);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleAddWithVariant = async () => {
    if (!selectedVariantId || !currentProduct || addingProductId) return;
    setAddingProductId(currentProduct.id);

    try {
      await addItem(currentProduct.id, selectedVariantId, 1);
      setShowVariantDialog(false);
      setCurrentProduct(null);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingProductId(null);
    }
  };

  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const variantPrice = (currentProduct?.price || 0) + (selectedVariant?.price_adjustment || 0);

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
            <Link href="/shop">Browse Collection</Link>
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
            
            // Check if couture product
            const coutureCollection = product.product_collections?.find(
              (pc: any) => pc.collections?.collection_type === "couture"
            )?.collections;
            const productUrl = coutureCollection
              ? `/couture/${coutureCollection.slug}/${product.slug}`
              : categorySlug 
                ? `/shop/${categorySlug}/${product.slug}` 
                : `/shop/all/${product.slug}`;
            
            const isCouture = coutureCollection !== undefined || product.product_type === "couture";

            return (
              <div key={favorite.id} className="group relative">
                {/* Mobile: Horizontal card layout */}
                <div className="flex gap-4 sm:hidden">
                  <Link href={productUrl} className="shrink-0">
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
                    <Link href={productUrl}>
                      <h3 className="font-display text-sm font-medium text-foreground line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    {!product.archived && !isCouture && (
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
                    )}
                    <div className="flex gap-2 mt-2">
                      {!isCouture && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 flex-1 gap-1.5 text-xs"
                          onClick={() => handleQuickAdd(product.id, product.name, Number(product.base_price))}
                          disabled={addingProductId === product.id}
                        >
                          {addingProductId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <ShoppingBag className="h-3.5 w-3.5" />
                              Add
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-destructive",
                          isCouture && "flex-1"
                        )}
                        onClick={() => removeMutation.mutate(favorite.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isCouture && <span>Remove</span>}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Desktop: Vertical card layout */}
                <div className="hidden sm:block">
                  <Link href={productUrl} className="block">
                    <div className="relative aspect-square overflow-hidden bg-secondary/50">
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

                      {/* Quick add button - bottom (hide for couture) */}
                      {!isCouture && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full backdrop-blur-sm bg-background/90 hover:bg-background"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleQuickAdd(product.id, product.name, Number(product.base_price));
                            }}
                            disabled={addingProductId === product.id}
                          >
                            {addingProductId === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </div>
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
                    <Link href={productUrl}>
                      <h3 className="font-display text-sm font-medium text-foreground transition-colors hover:text-primary lg:text-base">
                        {product.name}
                      </h3>
                    </Link>
                    {!product.archived && !isCouture && (
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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Variant Selection Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{currentProduct?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Select Option</Label>
              <RadioGroup
                value={selectedVariantId || ""}
                onValueChange={setSelectedVariantId}
                className="space-y-2"
              >
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors",
                      selectedVariantId === variant.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={variant.id} id={variant.id} />
                      <Label htmlFor={variant.id} className="cursor-pointer font-medium">
                        {variant.name}
                      </Label>
                    </div>
                    <span className="text-sm font-medium">
                      ${((currentProduct?.price || 0) + variant.price_adjustment).toLocaleString()}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              className="w-full"
              onClick={handleAddWithVariant}
              disabled={!selectedVariantId || !!addingProductId}
            >
              {addingProductId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart – ${variantPrice.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AccountLayout>
  );
}