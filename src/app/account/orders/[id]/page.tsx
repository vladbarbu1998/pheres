import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import OrderDetail from "@/views/account/OrderDetail";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false },
};

export default function Page() {
  return (
    <ProtectedRoute>
      <OrderDetail />
    </ProtectedRoute>
  );
}
