import type { Metadata } from "next";
import Checkout from "@/views/Checkout";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your PHERES order.",
  robots: { index: false },
};

export default function Page() {
  return <Checkout />;
}
