import type { Metadata } from "next";
import Index from "@/views/Index";

export const metadata: Metadata = {
  title: "PHERES | Luxury Fine Jewelry | Hong Kong",
  description:
    "Discover PHERES — couture and ready-to-wear fine jewelry crafted in Hong Kong since 2006 with rare diamonds and gemstones.",
  alternates: { canonical: "https://pheres.com/" },
  openGraph: {
    title: "PHERES | Luxury Fine Jewelry",
    description: "Couture and ready-to-wear fine jewelry from Hong Kong since 2006.",
    url: "https://pheres.com/",
    type: "website",
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "PHERES - Luxury Fine Jewelry House",
  description: "Discover exceptional couture and ready-to-wear fine jewelry by PHERES.",
  url: "https://pheres.com/",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".brand-heritage-section"],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Index />
    </>
  );
}
