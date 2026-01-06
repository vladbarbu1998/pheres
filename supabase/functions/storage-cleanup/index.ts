import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleanupRequest {
  fileUrls: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's JWT to verify they're admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Check if user is admin
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      console.error("Role check error:", roleError);
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { fileUrls } = (await req.json()) as CleanupRequest;

    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return new Response(JSON.stringify({ error: "No file URLs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[storage-cleanup] Cleaning up ${fileUrls.length} file(s)`);

    // Use service role client for storage operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const results: { url: string; deleted: boolean; error?: string }[] = [];

    for (const fileUrl of fileUrls) {
      try {
        // Parse the storage URL to extract bucket and path
        // URLs look like: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file.jpg
        const urlMatch = fileUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        
        if (!urlMatch) {
          console.log(`[storage-cleanup] Skipping non-storage URL: ${fileUrl}`);
          results.push({ url: fileUrl, deleted: false, error: "Not a storage URL" });
          continue;
        }

        const [, bucket, filePath] = urlMatch;
        console.log(`[storage-cleanup] Deleting from bucket "${bucket}": ${filePath}`);

        // Check if this file is still referenced anywhere
        const isReferenced = await checkFileReferences(adminClient, fileUrl);
        
        if (isReferenced) {
          console.log(`[storage-cleanup] File still referenced, skipping: ${fileUrl}`);
          results.push({ url: fileUrl, deleted: false, error: "Still referenced" });
          continue;
        }

        // Delete the file
        const { error: deleteError } = await adminClient.storage
          .from(bucket)
          .remove([filePath]);

        if (deleteError) {
          console.error(`[storage-cleanup] Delete error for ${filePath}:`, deleteError);
          results.push({ url: fileUrl, deleted: false, error: deleteError.message });
        } else {
          console.log(`[storage-cleanup] Deleted: ${filePath}`);
          results.push({ url: fileUrl, deleted: true });
        }
      } catch (err) {
        console.error(`[storage-cleanup] Error processing ${fileUrl}:`, err);
        results.push({ url: fileUrl, deleted: false, error: String(err) });
      }
    }

    const deletedCount = results.filter((r) => r.deleted).length;
    console.log(`[storage-cleanup] Completed: ${deletedCount}/${fileUrls.length} files deleted`);

    return new Response(JSON.stringify({ success: true, results, deletedCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[storage-cleanup] Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Check if a file URL is still referenced by any entity
async function checkFileReferences(client: any, fileUrl: string): Promise<boolean> {
  // Check product_images
  const { data: productImages } = await client
    .from("product_images")
    .select("id")
    .eq("image_url", fileUrl)
    .limit(1);
  if (productImages && productImages.length > 0) return true;

  // Check categories
  const { data: categories } = await client
    .from("categories")
    .select("id")
    .eq("image_url", fileUrl)
    .limit(1);
  if (categories && categories.length > 0) return true;

  // Check collections
  const { data: collections } = await client
    .from("collections")
    .select("id")
    .eq("image_url", fileUrl)
    .limit(1);
  if (collections && collections.length > 0) return true;

  // Check press_entries
  const { data: press } = await client
    .from("press_entries")
    .select("id")
    .eq("image_url", fileUrl)
    .limit(1);
  if (press && press.length > 0) return true;

  // Check news
  const { data: news } = await client
    .from("news")
    .select("id")
    .eq("image_url", fileUrl)
    .limit(1);
  if (news && news.length > 0) return true;

  return false;
}
