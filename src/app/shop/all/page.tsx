import type { Metadata } from "next";
import ShopAllRedirect from "@/views/ShopAllRedirect";

export const metadata: Metadata = {
  title: "Shop All",
  alternates: { canonical: "https://pheres.com/shop" },
};

export default function Page() {
  return <ShopAllRedirect />;
}
