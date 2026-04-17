import type { Metadata } from "next";
import Product from "@/views/Product";
import { supabase } from "@/integrations/supabase/client";

type Params = { categorySlug: string; productSlug: string };

async function fetchProduct(productSlug: string) {
  const { data } = await supabase
    .from("products")
    .select(
      "name, short_description, description, base_price, sku, is_active, archived, slug, categories(name, slug), product_images(image_url, is_primary, display_order)"
    )
    .eq("slug", productSlug)
    .maybeSingle();
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const product = await fetchProduct(productSlug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const desc =
    product.short_description ||
    product.description?.slice(0, 160) ||
    `Discover ${product.name} by PHERES — luxury fine jewelry crafted with exceptional materials.`;

  const images = (product.product_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  const primaryImage = images[0]?.image_url;

  return {
    title: product.name,
    description: desc,
    alternates: {
      canonical: `https://pheres.com/shop/${categorySlug}/${productSlug}`,
    },
    openGraph: {
      title: `${product.name} | PHERES`,
      description: desc,
      url: `https://pheres.com/shop/${categorySlug}/${productSlug}`,
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
  const { categorySlug, productSlug } = await params;
  const product = await fetchProduct(productSlug);

  const sortedImages = (product?.product_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });

  const productUrl = `https://pheres.com/shop/${categorySlug}/${productSlug}`;
  const categoryName = (product?.categories as { name?: string } | null)?.name;

  // JSON-LD content is built from server-fetched DB data and serialized via JSON.stringify.
  // This is the standard Next.js pattern for emitting structured data; not user-supplied HTML.
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
    ...(Number(product.base_price) > 0
      ? {
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "USD",
            price: Number(product.base_price),
            availability:
              product.is_active && !product.archived
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }
      : {}),
  };

  const breadcrumbLd = product && {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pheres.com/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://pheres.com/shop" },
      ...(categoryName
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: categoryName,
              item: `https://pheres.com/shop/category/${categorySlug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: categoryName ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      {productLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- JSON.stringify of server-fetched DB data, standard SEO pattern
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- JSON.stringify of server-fetched DB data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <Product />
    </>
  );
}
