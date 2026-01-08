import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useOrder(orderId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order", orderId, user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!orderId,
  });
}

export function useAddresses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useFavorites() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          *,
          products (
            id,
            name,
            slug,
            base_price,
            compare_at_price,
            is_new,
            product_type,
            categories (
              slug
            ),
            product_images (
              image_url,
              is_primary
            ),
            product_collections (
              collections (
                name,
                slug,
                collection_type
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
