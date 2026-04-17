import type { Metadata } from "next";
import ProductRedirect from "@/views/ProductRedirect";

export const metadata: Metadata = {
  title: "Product",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ProductRedirect />;
}
