import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Categories from "@/views/admin/Categories";

export const metadata: Metadata = {
  title: "Admin Categories",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Categories />
    </AdminProtectedRoute>
  );
}
