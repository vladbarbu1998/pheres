import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  is_new: boolean;
  archived: boolean;
  product_type: "couture" | "ready_to_wear";
  product_images: {
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }[];
  product_collections: {
    collection_id: string;
    collections: {
      id: string;
      name: string;
      slug: string;
      collection_type: "couture" | "ready_to_wear";
      archived: boolean;
    } | null;
  }[];
  categories: {
    slug: string;
  } | null;
}

export function useRecentlyViewedProducts(productIds: string[]) {
  return useQuery({
    queryKey: ["recently-viewed-products", productIds],
    queryFn: async (): Promise<RecentlyViewedProduct[]> => {
      if (productIds.length === 0) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          base_price,
          compare_at_price,
          is_new,
          archived,
          product_type,
          product_images (
            id,
            image_url,
            is_primary,
            display_order
          ),
          product_collections (
            collection_id,
            collections (
              id,
              name,
              slug,
              collection_type,
              archived
            )
          ),
          categories (
            slug
          )
        `)
        .in("id", productIds)
        .eq("is_active", true)
        .eq("archived", false);

      if (error) throw error;

      // Maintain the order from productIds
      const productMap = new Map((data || []).map((p) => [p.id, p]));
      return productIds
        .map((id) => productMap.get(id))
        .filter((p): p is RecentlyViewedProduct => p !== undefined);
    },
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
