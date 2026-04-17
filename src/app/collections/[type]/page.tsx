import type { Metadata } from "next";
import CollectionType from "@/views/CollectionType";

const TYPE_META: Record<string, { title: string; description: string }> = {
  couture: {
    title: "Couture Collections",
    description:
      "Exceptional high jewelry, crafted with rare gemstones and unparalleled artistry for the most discerning collectors.",
  },
  "ready-to-wear": {
    title: "Ready to Wear Collections",
    description:
      "Refined luxury jewelry, designed for everyday elegance and available for immediate discovery.",
  },
};

type Params = { type: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = TYPE_META[type];
  if (!meta) {
    return { title: "Collections", alternates: { canonical: "https://pheres.com/collections" } };
  }
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://pheres.com/collections/${type}` },
    openGraph: {
      title: `${meta.title} | PHERES`,
      description: meta.description,
      url: `https://pheres.com/collections/${type}`,
    },
  };
}

export default function Page() {
  return <CollectionType />;
}
