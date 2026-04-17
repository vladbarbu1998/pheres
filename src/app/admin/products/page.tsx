import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Products from "@/views/admin/Products";

export const metadata: Metadata = {
  title: "Admin Products",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Products />
    </AdminProtectedRoute>
  );
}
