import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import ProductForm from "@/views/admin/ProductForm";

export const metadata: Metadata = {
  title: "Edit Product",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <ProductForm />
    </AdminProtectedRoute>
  );
}
