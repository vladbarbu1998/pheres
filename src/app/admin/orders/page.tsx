import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Orders from "@/views/admin/Orders";

export const metadata: Metadata = {
  title: "Admin Orders",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Orders />
    </AdminProtectedRoute>
  );
}
