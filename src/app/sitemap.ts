import type { MetadataRoute } from "next";
import { supabase } from "@/integrations/supabase/client";

const BASE = "https://pheres.com";

type Entry = MetadataRoute.Sitemap[number];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/story`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/celebrities`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/press`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/gioro`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/concierge-service`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/shop/all`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/collections/couture`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/collections/ready-to-wear`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cookie-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/shipping`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const dynamicRoutes: Entry[] = [];

  // Categories: /shop/category/<slug>
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("slug, updated_at, is_active")
      .eq("is_active", true);
    if (error) throw error;
    for (const row of data ?? []) {
      if (!row.slug) continue;
      dynamicRoutes.push({
        url: `${BASE}/shop/category/${row.slug}`,
        lastModified: row.updated_at ? new Date(row.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error("[sitemap] categories failed:", err);
  }

  // Collections: /shop/collection/<slug> and /couture/<slug> for couture-type
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("slug, updated_at, collection_type, is_active, archived")
      .eq("is_active", true);
    if (error) throw error;
    for (const row of data ?? []) {
      if (!row.slug) continue;
      const lastModified = row.updated_at ? new Date(row.updated_at) : undefined;
      if (row.collection_type === "couture") {
        dynamicRoutes.push({
          url: `${BASE}/couture/${row.slug}`,
          lastModified,
          changeFrequency: "monthly",
          priority: row.archived ? 0.4 : 0.8,
        });
      } else {
        dynamicRoutes.push({
          url: `${BASE}/shop/collection/${row.slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch (err) {
    console.error("[sitemap] collections failed:", err);
  }

  // Products: /shop/<categorySlug>/<productSlug>
  // Couture products also at /couture/<collectionSlug>/<productSlug>
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `slug, updated_at, is_active, archived, product_type,
         categories ( slug ),
         product_collections (
           collections ( slug, collection_type )
         )`
      )
      .eq("is_active", true);
    if (error) throw error;
    for (const row of data ?? []) {
      if (!row.slug) continue;
      const lastModified = row.updated_at ? new Date(row.updated_at) : undefined;
      const categorySlug = (row.categories as { slug: string | null } | null)?.slug;
      if (categorySlug) {
        dynamicRoutes.push({
          url: `${BASE}/shop/${categorySlug}/${row.slug}`,
          lastModified,
          changeFrequency: "weekly",
          priority: row.archived ? 0.4 : 0.8,
        });
      }

      // Add couture URL if product is part of any couture collection
      const pcs = (row.product_collections ?? []) as Array<{
        collections: { slug: string | null; collection_type: string | null } | null;
      }>;
      for (const pc of pcs) {
        const c = pc.collections;
        if (c?.slug && c.collection_type === "couture") {
          dynamicRoutes.push({
            url: `${BASE}/couture/${c.slug}/${row.slug}`,
            lastModified,
            changeFrequency: "monthly",
            priority: row.archived ? 0.4 : 0.7,
          });
        }
      }
    }
  } catch (err) {
    console.error("[sitemap] products failed:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
