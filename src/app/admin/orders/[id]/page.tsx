import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import OrderDetail from "@/views/admin/OrderDetail";

export const metadata: Metadata = {
  title: "Order Detail",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <OrderDetail />
    </AdminProtectedRoute>
  );
}
