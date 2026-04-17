"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PressOutlet = {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export function usePressOutlets() {
  return useQuery({
    queryKey: ["press-outlets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_outlets")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PressOutlet[];
    },
  });
}

export function useAdminPressOutlets() {
  return useQuery({
    queryKey: ["admin-press-outlets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_outlets")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as PressOutlet[];
    },
  });
}

export function useCreatePressOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outlet: Omit<PressOutlet, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("press_outlets")
        .insert([outlet])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["press-outlets"] });
    },
  });
}

export function useUpdatePressOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...outlet }: Partial<PressOutlet> & { id: string }) => {
      const { data, error } = await supabase
        .from("press_outlets")
        .update(outlet)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["press-outlets"] });
    },
  });
}

export function useDeletePressOutlet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("press_outlets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-press-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["press-outlets"] });
    },
  });
}