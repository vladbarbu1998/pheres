import { useCallback } from "react";

const STORAGE_KEY = "pheres_recently_viewed";
const MAX_ITEMS = 20;

export type ProductType = "couture" | "ready_to_wear";

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  productType: ProductType;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const getItems = useCallback((): RecentlyViewedItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }, []);

  const addProduct = useCallback(
    (product: { id: string; slug: string; productType: ProductType }) => {
      const items = getItems();
      
      // Remove if already exists
      const filtered = items.filter((item) => item.id !== product.id);
      
      // Add to front with timestamp
      const newItem: RecentlyViewedItem = {
        ...product,
        viewedAt: Date.now(),
      };
      
      // Keep only MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // localStorage might be full or unavailable
      }
    },
    [getItems]
  );

  const getRecentlyViewed = useCallback(
    (filterByType?: ProductType, excludeId?: string): RecentlyViewedItem[] => {
      let items = getItems();
      
      if (filterByType) {
        items = items.filter((item) => item.productType === filterByType);
      }
      
      if (excludeId) {
        items = items.filter((item) => item.id !== excludeId);
      }
      
      return items;
    },
    [getItems]
  );

  return { addProduct, getRecentlyViewed };
}
