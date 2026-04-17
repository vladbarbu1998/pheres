import type { Metadata } from "next";
import Press from "@/views/Press";

export const metadata: Metadata = {
  title: "Press",
  description:
    "Editorial features, press coverage, and media mentions of PHERES luxury fine jewelry from leading publications worldwide.",
  alternates: { canonical: "https://pheres.com/press" },
  openGraph: {
    title: "Press | PHERES",
    description: "Press coverage and media features of PHERES jewelry.",
    url: "https://pheres.com/press",
  },
};

export default function Page() {
  return <Press />;
}
