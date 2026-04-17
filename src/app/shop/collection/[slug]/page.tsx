import type { Metadata } from "next";
import Collection from "@/views/Collection";
import { supabase } from "@/integrations/supabase/client";

type Params = { slug: string };

async function fetchCollection(slug: string) {
  const { data } = await supabase
    .from("collections")
    .select("name, description, image_url, slug")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await fetchCollection(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  const cleanDesc = collection.description?.replace(/<[^>]*>/g, "").slice(0, 160);
  const desc =
    cleanDesc ||
    `Explore the ${collection.name} collection by PHERES — luxury fine jewelry crafted with exceptional artistry.`;

  return {
    title: `${collection.name} Collection`,
    description: desc,
    alternates: { canonical: `https://pheres.com/shop/collection/${slug}` },
    openGraph: {
      title: `${collection.name} Collection | PHERES`,
      description: desc,
      url: `https://pheres.com/shop/collection/${slug}`,
      images: collection.image_url ? [{ url: collection.image_url }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const collection = await fetchCollection(slug);

  const collectionPageLd = collection && {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.name} Collection | PHERES`,
    url: `https://pheres.com/shop/collection/${slug}`,
  };

  const breadcrumbLd = collection && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pheres.com/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://pheres.com/shop" },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.name,
        item: `https://pheres.com/shop/collection/${slug}`,
      },
    ],
  };

  return (
    <>
      {collectionPageLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <Collection />
    </>
  );
}
