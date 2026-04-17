import type { Metadata } from "next";
import Shop from "@/views/Shop";

export const metadata: Metadata = {
  title: { absolute: "Shop Luxury Jewelry | PHERES" },
  description:
    "Browse the PHERES collection of luxury fine jewelry — couture rings, necklaces, earrings, and bracelets.",
  alternates: { canonical: "https://pheres.com/shop" },
  openGraph: {
    title: "Shop | PHERES",
    description:
      "Browse the PHERES collection of luxury fine jewelry — couture rings, necklaces, earrings, and bracelets.",
    url: "https://pheres.com/shop",
  },
};

export default function Page() {
  return <Shop />;
}
