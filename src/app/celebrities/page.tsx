import type { Metadata } from "next";
import Celebrities from "@/views/Celebrities";

export const metadata: Metadata = {
  title: "Celebrities",
  description:
    "PHERES jewelry as worn by celebrities and tastemakers on red carpets and in editorial features around the world.",
  alternates: { canonical: "https://pheres.com/celebrities" },
  openGraph: {
    title: "Celebrities | PHERES",
    description: "PHERES jewelry as worn by celebrities and tastemakers.",
    url: "https://pheres.com/celebrities",
  },
};

export default function Page() {
  return <Celebrities />;
}
