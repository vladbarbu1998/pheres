import type { Metadata } from "next";
import OrderConfirmation from "@/views/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

export default function Page() {
  return <OrderConfirmation />;
}
