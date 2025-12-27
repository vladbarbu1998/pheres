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

export function useCelebrityEntries() {
  return useQuery({
    queryKey: ["press-celebrities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .eq("is_published", true)
        .not("celebrity_name", "is", null)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}

export function usePressArticles() {
  return useQuery({
    queryKey: ["press-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .eq("is_published", true)
        .is("celebrity_name", null)
        .not("external_link", "is", null)
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
