import type { Metadata } from "next";
import CoutureCollection from "@/views/CoutureCollection";
import { supabase } from "@/integrations/supabase/client";

type Params = { collectionSlug: string };

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
  const { collectionSlug } = await params;
  const collection = await fetchCollection(collectionSlug);

  if (!collection) {
    return { title: "Couture Collection Not Found" };
  }

  const cleanDesc = collection.description?.replace(/<[^>]*>/g, "").slice(0, 160);
  const desc =
    cleanDesc ||
    `Explore the ${collection.name} couture collection by PHERES. One-of-a-kind masterpieces available by inquiry.`;

  return {
    title: `${collection.name} Couture Collection`,
    description: desc,
    alternates: { canonical: `https://pheres.com/couture/${collectionSlug}` },
    openGraph: {
      title: `${collection.name} Couture Collection | PHERES`,
      description: desc,
      url: `https://pheres.com/couture/${collectionSlug}`,
      images: collection.image_url ? [{ url: collection.image_url }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { collectionSlug } = await params;
  const collection = await fetchCollection(collectionSlug);

  const collectionPageLd = collection && {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.name} Couture Collection | PHERES`,
    url: `https://pheres.com/couture/${collectionSlug}`,
  };

  const breadcrumbLd = collection && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pheres.com/" },
      { "@type": "ListItem", position: 2, name: "Couture", item: "https://pheres.com/collections/couture" },
      {
        "@type": "ListItem",
        position: 3,
        name: collection.name,
        item: `https://pheres.com/couture/${collectionSlug}`,
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
      <CoutureCollection />
    </>
  );
}
