"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

type CollectionType = "couture" | "ready_to_wear";

interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price?: number | null;
  is_new?: boolean;
  archived?: boolean;
  product_type?: string | null;
  product_images?: Array<{
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }>;
  product_collections?: Array<{
    collections: {
      name: string;
      slug?: string;
      collection_type?: CollectionType;
    } | null;
  }>;
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

async function searchProducts(query: string): Promise<SearchProduct[]> {
  if (!query.trim()) {
    return [];
  }

  const searchTerm = `%${query.trim()}%`;

  // Search across products with joins to categories and collections
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
      short_description,
      description,
      metal_type,
      stone_type,
      stone_carat,
      stone_color,
      stone_clarity,
      stone_cut,
      certification,
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
      ),
      categories (
        id,
        name,
        slug
      )
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  if (!data) return [];

  // Filter results based on search term matching multiple fields
  const lowerQuery = query.trim().toLowerCase();
  
  const filteredProducts = data.filter((product) => {
    // Check product name
    if (product.name?.toLowerCase().includes(lowerQuery)) return true;
    
    // Check descriptions
    if (product.short_description?.toLowerCase().includes(lowerQuery)) return true;
    if (product.description?.toLowerCase().includes(lowerQuery)) return true;
    
    // Check specifications
    if (product.metal_type?.toLowerCase().includes(lowerQuery)) return true;
    if (product.stone_type?.toLowerCase().includes(lowerQuery)) return true;
    if (product.stone_carat?.toLowerCase().includes(lowerQuery)) return true;
    if (product.stone_color?.toLowerCase().includes(lowerQuery)) return true;
    if (product.stone_clarity?.toLowerCase().includes(lowerQuery)) return true;
    if (product.stone_cut?.toLowerCase().includes(lowerQuery)) return true;
    if (product.certification?.toLowerCase().includes(lowerQuery)) return true;
    
    // Check category name
    if (product.categories?.name?.toLowerCase().includes(lowerQuery)) return true;
    
    // Check collection names
    const collectionMatch = product.product_collections?.some(
      (pc) => pc.collections?.name?.toLowerCase().includes(lowerQuery)
    );
    if (collectionMatch) return true;
    
    return false;
  });

  return filteredProducts;
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["search-products", query],
    queryFn: () => searchProducts(query),
    enabled: !!query.trim(),
  });
}

// Debounced search hook for instant autocomplete
export function useDebouncedSearch(initialQuery: string = "", delay: number = 250) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  const searchResult = useSearchProducts(debouncedQuery);

  return {
    query,
    setQuery,
    debouncedQuery,
    ...searchResult,
  };
}