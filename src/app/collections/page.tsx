import type { Metadata } from "next";
import Collections from "@/views/Collections";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore PHERES jewelry collections — discover our Couture high jewelry and Ready to Wear collections, crafted with rare diamonds and gemstones.",
  alternates: { canonical: "https://pheres.com/collections" },
  openGraph: {
    title: "Collections | PHERES",
    description:
      "Explore PHERES jewelry collections — Couture high jewelry and Ready to Wear collections.",
    url: "https://pheres.com/collections",
  },
};

export default function Page() {
  return <Collections />;
}
