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
      // If filtering by collection, get product IDs from product_collections first
      let collectionProductIds: string[] | null = null;
      if (filters?.collectionId) {
        const { data: collectionProducts, error: collectionError } = await supabase
          .from("product_collections")
          .select("product_id")
          .eq("collection_id", filters.collectionId);

        if (collectionError) throw collectionError;
        collectionProductIds = collectionProducts?.map((cp) => cp.product_id) || [];
      }

      // If filtering by stone type, get product IDs from product_stones first
      let stoneProductIds: string[] | null = null;
      if (filters?.stoneType) {
        const { data: stoneProducts, error: stoneError } = await supabase
          .from("product_stones")
          .select("product_id")
          .eq("stone_type", filters.stoneType);

        if (stoneError) throw stoneError;
        stoneProductIds = stoneProducts?.map((sp) => sp.product_id) || [];
      }

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

      // Filter by collection slug (for collection page)
      if (collectionSlug) {
        // Get product IDs for the collection slug
        const { data: slugProducts, error: slugError } = await supabase
          .from("product_collections")
          .select("product_id, collections!inner(slug)")
          .eq("collections.slug", collectionSlug);

        if (slugError) throw slugError;
        const slugProductIds = slugProducts?.map((sp) => sp.product_id) || [];
        if (slugProductIds.length > 0) {
          query = query.in("id", slugProductIds);
        } else {
          // No products in this collection, return empty
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      }

      // Apply filters
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      // Filter by collection ID
      if (filters?.collectionId && collectionProductIds !== null) {
        if (collectionProductIds.length > 0) {
          query = query.in("id", collectionProductIds);
        } else {
          // No products in this collection, return empty
          query = query.eq("id", "00000000-0000-0000-0000-000000000000");
        }
      }

      if (filters?.minPrice !== null && filters?.minPrice !== undefined) {
        query = query.gte("base_price", filters.minPrice);
      }

      if (filters?.maxPrice !== null && filters?.maxPrice !== undefined) {
        query = query.lte("base_price", filters.maxPrice);
      }

      // Filter by stone type - check both product.stone_type AND product_stones table
      if (filters?.stoneType && stoneProductIds !== null) {
        // Build OR filter: products where stone_type matches OR id is in stoneProductIds
        if (stoneProductIds.length > 0) {
          query = query.or(`stone_type.eq.${filters.stoneType},id.in.(${stoneProductIds.join(",")})`);
        } else {
          // No products in product_stones, just filter by stone_type on product
          query = query.eq("stone_type", filters.stoneType);
        }
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
      // Fetch all active products with their category_id, stone_type, collections, and product_stones
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          category_id,
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

      // Extract distinct category IDs that have active products
      const categoryIds = Array.from(
        new Set(
          (products || [])
            .map((p) => p.category_id)
            .filter((id): id is string => !!id)
        )
      );

      // Extract distinct stone types from both product.stone_type and product_stones table
      const stoneTypesFromProducts = (products || [])
        .map((p) => p.stone_type?.trim())
        .filter((s): s is string => !!s && s !== "");

      const stoneTypesFromStones = (products || [])
        .flatMap((p) => p.product_stones?.map((ps) => ps.stone_type?.trim()) || [])
        .filter((s): s is string => !!s && s !== "");

      // Deduplicate using a Map to handle case variations
      const stoneMap = new Map<string, string>();
      [...stoneTypesFromProducts, ...stoneTypesFromStones].forEach((s) => {
        const key = s.toLowerCase();
        // Keep the first occurrence (preserves original casing)
        if (!stoneMap.has(key)) {
          stoneMap.set(key, s);
        }
      });
      const stoneTypes = Array.from(stoneMap.values()).sort();

      // Extract distinct collection IDs that have active products
      const collectionIds = Array.from(
        new Set(
          (products || [])
            .flatMap((p) => p.product_collections?.map((pc) => pc.collection_id) || [])
            .filter((id): id is string => !!id)
        )
      );

      return {
        stoneTypes,
        activeCategoryIds: categoryIds,
        activeCollectionIds: collectionIds,
      };
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
