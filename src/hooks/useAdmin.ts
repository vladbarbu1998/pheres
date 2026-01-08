import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }

      return data === true;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Dashboard stats
export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, collections, orders, customers, messages] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("collections").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, status", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id, is_read", { count: "exact" }),
      ]);

      const ordersByStatus = orders.data?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const unreadMessages = messages.data?.filter(m => !m.is_read).length || 0;

      return {
        productsCount: products.count || 0,
        collectionsCount: collections.count || 0,
        ordersCount: orders.count || 0,
        customersCount: customers.count || 0,
        messagesCount: messages.count || 0,
        unreadMessagesCount: unreadMessages,
        ordersByStatus,
      };
    },
  });
}

// Recent orders
export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: ["admin-recent-orders", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at, shipping_first_name, shipping_last_name")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

// Recent messages
export function useRecentMessages(limit = 5) {
  return useQuery({
    queryKey: ["admin-recent-messages", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

// Products list with optional filters
export function useAdminProducts(filters?: { categoryId?: string; collectionId?: string }) {
  return useQuery({
    queryKey: ["admin-products", filters?.categoryId, filters?.collectionId],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name),
          product_images(id, image_url, is_primary, display_order),
          product_collections(collection_id, collections(id, name))
        `)
        .order("created_at", { ascending: false });

      // Filter by category
      if (filters?.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      // Filter by collection - need to filter after fetch since it's a join
      const { data, error } = await query;

      if (error) throw error;

      // Client-side filter for collection (Supabase doesn't support filtering on nested joins easily)
      if (filters?.collectionId && data) {
        return data.filter((product: any) =>
          product.product_collections?.some(
            (pc: any) => pc.collection_id === filters.collectionId
          )
        );
      }

      return data;
    },
  });
}

// Single product
export function useAdminProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(id, name),
          product_images(id, image_url, alt_text, is_primary, display_order),
          product_variants(id, name, sku, price_adjustment, stock_quantity, is_active),
          product_collections(collection_id, collections(id, name)),
          product_stones(id, stone_type, stone_carat, stone_color, stone_clarity, stone_cut, display_order),
          product_metals(id, metal_type, metal_weight, display_order)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// All collections (for admin, includes parent_id)
export function useAdminCollections() {
  return useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Parent (root) collections only
export function useAdminParentCollections() {
  return useQuery({
    queryKey: ["admin-parent-collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .is("parent_id", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Child collections by parent ID (for admin tabs)
export function useAdminChildCollections(parentId: string | null) {
  return useQuery({
    queryKey: ["admin-child-collections", parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("parent_id", parentId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!parentId,
  });
}

// Child collections by type (for admin tabs: "Couture" / "Ready To Wear")
export function useAdminCollectionsByType(collectionType: "couture" | "ready_to_wear") {
  return useQuery({
    queryKey: ["admin-collections-by-type", collectionType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .eq("collection_type", collectionType)
        .not("parent_id", "is", null) // Only child collections
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Get parent collection ID by type (helper for creating child collections)
export function useParentCollectionByType(collectionType: "couture" | "ready_to_wear") {
  return useQuery({
    queryKey: ["parent-collection-by-type", collectionType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("id, name, slug, collection_type")
        .eq("collection_type", collectionType)
        .is("parent_id", null)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

// Categories
export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Orders
export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Single order with items
export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Customers (profiles)
export function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// News
export function useAdminNews() {
  return useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Press entries
export function useAdminPress() {
  return useQuery({
    queryKey: ["admin-press"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

// Contact messages
export function useAdminMessages() {
  return useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Couture inquiries
export function useAdminCoutureInquiries() {
  return useQuery({
    queryKey: ["admin-couture-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("couture_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Get all distinct stone types from product_stones table (for admin combobox)
export function useAllStoneTypes() {
  return useQuery({
    queryKey: ["all-stone-types"],
    queryFn: async () => {
      // Get stone types from product_stones table
      const { data: stonesData, error: stonesError } = await supabase
        .from("product_stones")
        .select("stone_type");

      if (stonesError) throw stonesError;

      // Get stone types from products table (legacy field)
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("stone_type")
        .not("stone_type", "is", null);

      if (productsError) throw productsError;

      // Combine and deduplicate
      const allTypes = new Set<string>();
      
      stonesData?.forEach((s) => {
        if (s.stone_type?.trim()) {
          allTypes.add(s.stone_type.trim());
        }
      });

      productsData?.forEach((p) => {
        if (p.stone_type?.trim()) {
          allTypes.add(p.stone_type.trim());
        }
      });

      return Array.from(allTypes).sort();
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}
