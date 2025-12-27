import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["search-products", query],
    queryFn: async () => {
      if (!query.trim()) {
        return { products: [] };
      }

      const searchTerm = `%${query.trim()}%`;

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
            is_primary,
            display_order
          ),
          product_collections (
            collections (
              name
            )
          )
        `
        )
        .eq("is_active", true)
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},short_description.ilike.${searchTerm}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return {
        products: data || [],
      };
    },
    enabled: !!query.trim(),
  });
}
