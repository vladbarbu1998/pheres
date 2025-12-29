import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CleanupResult {
  url: string;
  deleted: boolean;
  error?: string;
}

interface CleanupResponse {
  success: boolean;
  results: CleanupResult[];
  deletedCount: number;
}

/**
 * Hook to clean up orphaned storage files.
 * Only deletes files that are no longer referenced by any entity.
 */
export function useStorageCleanup() {
  return useMutation({
    mutationFn: async (fileUrls: string[]): Promise<CleanupResponse> => {
      if (!fileUrls || fileUrls.length === 0) {
        console.log("[useStorageCleanup] No URLs provided, skipping");
        return { success: true, results: [], deletedCount: 0 };
      }

      // Filter out empty/null URLs
      const validUrls = fileUrls.filter((url) => url && url.trim() !== "");
      if (validUrls.length === 0) {
        console.log("[useStorageCleanup] No valid URLs after filtering, skipping");
        return { success: true, results: [], deletedCount: 0 };
      }

      console.log(`[useStorageCleanup] Requesting cleanup for ${validUrls.length} file(s):`, validUrls);

      try {
        const { data, error } = await supabase.functions.invoke("storage-cleanup", {
          body: { fileUrls: validUrls },
        });

        if (error) {
          console.error("[useStorageCleanup] Function invoke error:", error);
          // Don't throw - we don't want to break the UI if cleanup fails
          return { success: false, results: [], deletedCount: 0 };
        }

        console.log(`[useStorageCleanup] Success:`, data);
        return data as CleanupResponse;
      } catch (err) {
        console.error("[useStorageCleanup] Exception:", err);
        // Graceful failure - don't break the UI
        return { success: false, results: [], deletedCount: 0 };
      }
    },
  });
}

/**
 * Utility to extract all image URLs from a product for cleanup.
 */
export function getProductImageUrls(product: {
  product_images?: { image_url: string }[];
}): string[] {
  const urls: string[] = [];

  if (product.product_images) {
    product.product_images.forEach((img) => {
      if (img.image_url) urls.push(img.image_url);
    });
  }

  return urls;
}

/**
 * Utility to get entity image URL for cleanup.
 */
export function getEntityImageUrl(entity: { image_url?: string | null }): string[] {
  if (entity.image_url) {
    return [entity.image_url];
  }
  return [];
}
