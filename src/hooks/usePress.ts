import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SECTION_ORDER = ["Red Carpet", "Magazine Cover", "Special Appearance"] as const;

export type CelebrityAppearance = {
  id: string;
  title: string;
  slug: string;
  celebrity_name: string | null;
  event_name: string | null;
  event_date: string | null;
  location: string | null;
  section: string | null;
  image_url: string | null;
  jewelry_photo_url: string | null;
  description: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
};

export type GroupedCelebrities = {
  section: string;
  appearances: CelebrityAppearance[];
};

export function useCelebrityAppearances() {
  return useQuery({
    queryKey: ["celebrity-appearances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .eq("is_published", true)
        .not("celebrity_name", "is", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      const appearances = (data || []) as CelebrityAppearance[];
      
      // Sort by display_order first, then by event_date (newest first)
      return appearances.sort((a, b) => {
        // First by display_order
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order;
        }
        // Then by event_date (newest first)
        if (a.event_date && b.event_date) {
          return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
        }
        if (a.event_date) return -1;
        if (b.event_date) return 1;
        return 0;
      });
    },
  });
}

// Legacy grouped version (kept for backward compatibility if needed)
export function useCelebrityAppearancesGrouped() {
  return useQuery({
    queryKey: ["celebrity-appearances-grouped"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .eq("is_published", true)
        .not("celebrity_name", "is", null)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      const appearances = (data || []) as CelebrityAppearance[];
      
      // Group by section
      const grouped: GroupedCelebrities[] = [];
      
      for (const section of SECTION_ORDER) {
        const sectionAppearances = appearances
          .filter((a) => a.section === section)
          .sort((a, b) => {
            if (a.display_order !== b.display_order) {
              return a.display_order - b.display_order;
            }
            if (a.event_date && b.event_date) {
              return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
            }
            return 0;
          });
        
        if (sectionAppearances.length > 0) {
          grouped.push({ section, appearances: sectionAppearances });
        }
      }
      
      const noSectionAppearances = appearances
        .filter((a) => !a.section || !SECTION_ORDER.includes(a.section as any))
        .sort((a, b) => a.display_order - b.display_order);
      
      if (noSectionAppearances.length > 0) {
        grouped.push({ section: "Other Appearances", appearances: noSectionAppearances });
      }
      
      return grouped;
    },
  });
}

// Legacy hooks for backward compatibility
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
