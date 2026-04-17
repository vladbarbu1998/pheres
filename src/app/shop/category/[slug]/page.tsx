import type { Metadata } from "next";
import Category from "@/views/Category";
import { supabase } from "@/integrations/supabase/client";

type Params = { slug: string };

async function fetchCategory(slug: string) {
  const { data } = await supabase
    .from("categories")
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
  const category = await fetchCategory(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const desc =
    category.description?.slice(0, 160) ||
    `Shop ${category.name} from PHERES — luxury fine jewelry crafted with rare diamonds and gemstones.`;

  return {
    title: `${category.name} | PHERES Fine Jewelry`,
    description: desc,
    alternates: { canonical: `https://pheres.com/shop/category/${slug}` },
    openGraph: {
      title: `${category.name} | PHERES`,
      description: desc,
      url: `https://pheres.com/shop/category/${slug}`,
      images: category.image_url ? [{ url: category.image_url }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  const breadcrumbLd = category && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pheres.com/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://pheres.com/shop" },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `https://pheres.com/shop/category/${slug}`,
      },
    ],
  };

  const collectionPageLd = category && {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} | PHERES`,
    description:
      category.description?.replace(/<[^>]*>/g, "").slice(0, 500) ||
      `${category.name} jewelry by PHERES`,
    url: `https://pheres.com/shop/category/${slug}`,
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
      <Category />
    </>
  );
}
