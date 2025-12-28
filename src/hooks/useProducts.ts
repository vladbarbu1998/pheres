import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FilterState, SortOption } from "@/components/shop/ShopFilters";

interface UseProductsOptions {
  filters?: FilterState;
  sortBy?: SortOption;
  collectionSlug?: string;
  page?: number;
  pageSize?: number;
}

export function useProducts({
  filters,
  sortBy = "newest",
  collectionSlug,
  page = 1,
  pageSize = 12,
}: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ["products", filters, sortBy, collectionSlug, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          base_price,
          compare_at_price,
          is_new,
          is_bestseller,
          is_featured,
          metal_type,
          stone_type,
          category_id,
          created_at,
          product_images (
            image_url,
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
          product_stones (
            stone_type
          )
        `,
          { count: "exact" }
        )
        .eq("is_active", true);

      // Filter by collection slug
      if (collectionSlug) {
        query = query.eq("product_collections.collections.slug", collectionSlug);
      }

      // Apply filters
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters?.collectionId) {
        query = query.eq("product_collections.collection_id", filters.collectionId);
      }

      if (filters?.minPrice !== null && filters?.minPrice !== undefined) {
        query = query.gte("base_price", filters.minPrice);
      }

      if (filters?.maxPrice !== null && filters?.maxPrice !== undefined) {
        query = query.lte("base_price", filters.maxPrice);
      }

      if (filters?.metalType) {
        query = query.eq("metal_type", filters.metalType);
      }

      if (filters?.stoneType) {
        // Filter by stone_type on product OR in product_stones table
        query = query.or(`stone_type.eq.${filters.stoneType},product_stones.stone_type.eq.${filters.stoneType}`);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-asc":
          query = query.order("base_price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("base_price", { ascending: false });
          break;
        case "bestsellers":
          query = query.order("is_bestseller", { ascending: false }).order("created_at", { ascending: false });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
        currentPage: page,
      };
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, description, image_url, is_featured")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}

// Hook to get distinct filter options from active products
export function useProductFilterOptions() {
  return useQuery({
    queryKey: ["product-filter-options"],
    queryFn: async () => {
      // Fetch all active products with their metal_type, stone_type, collections, and product_stones
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          metal_type,
          stone_type,
          product_collections (
            collection_id
          ),
          product_stones (
            stone_type
          )
        `)
        .eq("is_active", true);

      if (error) throw error;

      // Extract distinct metal types
      const metalTypes = Array.from(
        new Set(
          (products || [])
            .map((p) => p.metal_type)
            .filter((m): m is string => !!m && m.trim() !== "")
        )
      ).sort();

      // Extract distinct stone types from both product.stone_type and product_stones table
      const stoneTypesFromProducts = (products || [])
        .map((p) => p.stone_type)
        .filter((s): s is string => !!s && s.trim() !== "");

      const stoneTypesFromStones = (products || [])
        .flatMap((p) => p.product_stones?.map((ps) => ps.stone_type) || [])
        .filter((s): s is string => !!s && s.trim() !== "");

      const stoneTypes = Array.from(
        new Set([...stoneTypesFromProducts, ...stoneTypesFromStones])
      ).sort();

      // Extract distinct collection IDs that have active products
      const collectionIds = Array.from(
        new Set(
          (products || [])
            .flatMap((p) => p.product_collections?.map((pc) => pc.collection_id) || [])
            .filter((id): id is string => !!id)
        )
      );

      return {
        metalTypes,
        stoneTypes,
        activeCollectionIds: collectionIds,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
