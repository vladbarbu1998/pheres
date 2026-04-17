import type { Metadata } from "next";
import Returns from "@/views/Returns";

export const metadata: Metadata = {
  title: "Shipping",
  description: "PHERES shipping policy — secure white-glove delivery of fine jewelry worldwide.",
  alternates: { canonical: "https://pheres.com/shipping" },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <Returns />;
}
