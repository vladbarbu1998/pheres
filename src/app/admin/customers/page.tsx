import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Customers from "@/views/admin/Customers";

export const metadata: Metadata = {
  title: "Admin Customers",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Customers />
    </AdminProtectedRoute>
  );
}
