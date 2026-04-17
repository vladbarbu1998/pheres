import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import PressOutlets from "@/views/admin/PressOutlets";

export const metadata: Metadata = {
  title: "Admin Press Outlets",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <PressOutlets />
    </AdminProtectedRoute>
  );
}
