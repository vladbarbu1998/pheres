import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePublishedPress() {
  return useQuery({
    queryKey: ["press-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useFeaturedPress() {
  return useQuery({
    queryKey: ["press-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });
}
