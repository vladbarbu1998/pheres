import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ["featured-products", limit],
    queryFn: async () => {
      // First try to get featured products
      let { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          base_price,
          compare_at_price,
          is_new,
          archived,
          product_type,
          product_images (
            image_url,
            is_primary,
            display_order
          ),
          product_collections (
            collections (
              name,
              slug,
              collection_type
            )
          )
        `
        )
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // If no featured products, get latest products
      if (!data || data.length === 0) {
        const { data: latestData, error: latestError } = await supabase
          .from("products")
          .select(
            `
            id,
            name,
            slug,
            base_price,
            compare_at_price,
            is_new,
            archived,
            product_type,
            product_images (
              image_url,
              is_primary,
              display_order
            ),
            product_collections (
              collections (
                name,
                slug,
                collection_type
              )
            )
          `
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(limit);

        if (latestError) throw latestError;
        data = latestData;
      }

      return {
        products: data || [],
      };
    },
  });
}
