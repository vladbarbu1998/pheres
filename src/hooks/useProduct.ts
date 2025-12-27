import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          product_images (
            id,
            image_url,
            alt_text,
            is_primary,
            display_order
          ),
          product_collections (
            collection_id,
            collections (
              id,
              name,
              slug
            )
          ),
          categories (
            id,
            name,
            slug
          )
        `
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

export function useRelatedProducts(productId: string, collectionIds: string[]) {
  return useQuery({
    queryKey: ["related-products", productId, collectionIds],
    queryFn: async () => {
      if (collectionIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          base_price,
          compare_at_price,
          is_new,
          product_images (
            image_url,
            is_primary
          ),
          product_collections!inner (
            collection_id,
            collections (
              name
            )
          )
        `
        )
        .eq("is_active", true)
        .neq("id", productId)
        .in("product_collections.collection_id", collectionIds)
        .limit(8);

      if (error) throw error;

      // Remove duplicates (product might be in multiple matching collections)
      const uniqueProducts = data?.filter(
        (product, index, self) =>
          index === self.findIndex((p) => p.id === product.id)
      );

      return uniqueProducts || [];
    },
    enabled: !!productId && collectionIds.length > 0,
  });
}
