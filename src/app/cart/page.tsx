import type { Metadata } from "next";
import Cart from "@/views/Cart";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your PHERES selection.",
  robots: { index: false },
};

export default function Page() {
  return <Cart />;
}
