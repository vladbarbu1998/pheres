"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ["featured-products", limit],
    queryFn: async () => {
      // Get newest active, non-archived RTW products only (no couture)
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
        .eq("archived", false)
        .eq("product_type", "ready_to_wear")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        products: data || [],
      };
    },
  });
}