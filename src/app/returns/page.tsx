import type { Metadata } from "next";
import Returns from "@/views/Returns";

export const metadata: Metadata = {
  title: "Returns & Shipping",
  description: "PHERES returns, exchanges, and shipping policy — secure delivery and white-glove service worldwide.",
  alternates: { canonical: "https://pheres.com/returns" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Returns />;
}
