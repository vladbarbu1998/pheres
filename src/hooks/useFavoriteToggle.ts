import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFavoriteToggle(productId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if this product is favorited
  const { data: isFavorited, isLoading } = useQuery({
    queryKey: ["favorite-status", productId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!productId,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("Must be logged in");
      }

      // Check current state
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { action: "added" as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["favorite-status", productId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      
      if (result.action === "added") {
        toast.success("Added to favorites");
      } else {
        toast.success("Removed from favorites");
      }
    },
    onError: (error) => {
      console.error("Favorite toggle error:", error);
      toast.error("Failed to update favorites");
    },
  });

  const toggle = () => {
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }
    toggleMutation.mutate();
  };

  return {
    isFavorited: isFavorited ?? false,
    isLoading,
    isToggling: toggleMutation.isPending,
    toggle,
  };
}
