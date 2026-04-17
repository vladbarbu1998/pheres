import type { Metadata } from "next";
import Search from "@/views/Search";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the PHERES luxury jewelry catalog — find pieces by name, collection, or description.",
  alternates: { canonical: "https://pheres.com/search" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Search | PHERES",
    description: "Search the PHERES luxury jewelry catalog.",
    url: "https://pheres.com/search",
  },
};

export default function Page() {
  return <Search />;
}
