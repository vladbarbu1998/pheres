import type { Metadata } from "next";
import CoutureProduct from "@/views/CoutureProduct";
import { supabase } from "@/integrations/supabase/client";

type Params = { collectionSlug: string; productSlug: string };

async function fetchProduct(productSlug: string) {
  const { data } = await supabase
    .from("products")
    .select(
      "name, short_description, description, sku, slug, product_images(image_url, is_primary, display_order)"
    )
    .eq("slug", productSlug)
    .maybeSingle();
  return data;
}

async function fetchCollection(collectionSlug: string) {
  const { data } = await supabase
    .from("collections")
    .select("name, slug")
    .eq("slug", collectionSlug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { collectionSlug, productSlug } = await params;
  const product = await fetchProduct(productSlug);

  if (!product) {
    return { title: "Couture Piece Not Found" };
  }

  const desc =
    product.short_description ||
    product.description?.slice(0, 160) ||
    `Discover ${product.name}, an exceptional couture creation by PHERES. Inquire for availability.`;

  const images = (product.product_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  const primaryImage = images[0]?.image_url;

  return {
    title: `${product.name} | PHERES Couture`,
    description: desc,
    alternates: {
      canonical: `https://pheres.com/couture/${collectionSlug}/${productSlug}`,
    },
    openGraph: {
      title: `${product.name} | PHERES Couture`,
      description: desc,
      url: `https://pheres.com/couture/${collectionSlug}/${productSlug}`,
      type: "website",
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { collectionSlug, productSlug } = await params;
  const [product, collection] = await Promise.all([
    fetchProduct(productSlug),
    fetchCollection(collectionSlug),
  ]);

  const sortedImages = (product?.product_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });

  // Couture is inquiry-only - emit Product schema WITHOUT offers.
  const productLd = product && {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description?.replace(/<[^>]*>/g, "").slice(0, 500) ||
      product.short_description ||
      undefined,
    sku: product.sku || undefined,
    image: sortedImages.map((i) => i.image_url),
    brand: { "@type": "Brand", name: "PHERES" },
  };

  const breadcrumbLd = product && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pheres.com/" },
      { "@type": "ListItem", position: 2, name: "Couture", item: "https://pheres.com/collections/couture" },
      ...(collection
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: collection.name,
              item: `https://pheres.com/couture/${collectionSlug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: collection ? 4 : 3,
        name: product.name,
        item: `https://pheres.com/couture/${collectionSlug}/${productSlug}`,
      },
    ],
  };

  return (
    <>
      {productLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <CoutureProduct />
    </>
  );
}
