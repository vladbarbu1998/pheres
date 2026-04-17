import type { Metadata } from "next";
import ShopAllRedirect from "@/views/ShopAllRedirect";
import { supabase } from "@/integrations/supabase/client";

type Params = { productSlug: string };

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
  const { productSlug } = await params;
  const product = await fetchProduct(productSlug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const desc =
    product.short_description ||
    product.description?.slice(0, 160) ||
    `Shop ${product.name} from PHERES luxury jewelry.`;

  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `https://pheres.com/shop/all/${productSlug}` },
    openGraph: {
      title: `${product.name} | PHERES`,
      description: desc,
      url: `https://pheres.com/shop/all/${productSlug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<Params>;
}) {
  const { productSlug } = await params;
  const product = await fetchProduct(productSlug);

  const sortedImages = (product?.product_images || [])
    .slice()
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });

  const category = product?.categories as { name: string; slug: string } | null;
  const canonicalUrl = category
    ? `https://pheres.com/shop/${category.slug}/${productSlug}`
    : `https://pheres.com/shop/all/${productSlug}`;

  // JSON.stringify of server-fetched DB data; standard SEO JSON-LD pattern.
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
            url: canonicalUrl,
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

  return (
    <>
      {productLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- JSON.stringify of server-fetched DB data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
        />
      )}
      <ShopAllRedirect />
    </>
  );
}
