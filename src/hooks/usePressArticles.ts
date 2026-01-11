import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PressOutlet } from "./usePressOutlets";

export type PressArticle = {
  id: string;
  title: string;
  outlet_id: string;
  external_url: string;
  publish_date: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  is_highlight: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type PressArticleWithOutlet = PressArticle & {
  outlet: PressOutlet;
};

export function usePressArticles() {
  return useQuery({
    queryKey: ["press-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_articles")
        .select(`
          *,
          outlet:press_outlets(*)
        `)
        .eq("is_active", true)
        .order("publish_date", { ascending: false, nullsFirst: false })
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PressArticleWithOutlet[];
    },
  });
}

export function useAdminPressArticles() {
  return useQuery({
    queryKey: ["admin-press-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_articles")
        .select(`
          *,
          outlet:press_outlets(*)
        `)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PressArticleWithOutlet[];
    },
  });
}

export function useCreatePressArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: Omit<PressArticle, "id" | "created_at" | "updated_at" | "thumbnail_url">) => {
      const { data, error } = await supabase
        .from("press_articles")
        .insert([article])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-articles"] });
      queryClient.invalidateQueries({ queryKey: ["press-articles"] });
    },
  });
}

export function useUpdatePressArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...article }: Partial<PressArticle> & { id: string }) => {
      const { data, error } = await supabase
        .from("press_articles")
        .update(article)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-articles"] });
      queryClient.invalidateQueries({ queryKey: ["press-articles"] });
    },
  });
}

export function useDeletePressArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("press_articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-articles"] });
      queryClient.invalidateQueries({ queryKey: ["press-articles"] });
    },
  });
}
