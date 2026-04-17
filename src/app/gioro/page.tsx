import type { Metadata } from "next";
import Gioro from "@/views/Gioro";

export const metadata: Metadata = {
  title: "Gioro",
  description:
    "Discover Gioro — a signature collection by PHERES, marrying traditional craftsmanship with modern luxury.",
  alternates: { canonical: "https://pheres.com/gioro" },
  openGraph: {
    title: "Gioro | PHERES",
    description: "Signature collection by PHERES.",
    url: "https://pheres.com/gioro",
  },
};

export default function Page() {
  return <Gioro />;
}
