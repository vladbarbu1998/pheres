import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Celebrities from "@/views/admin/Celebrities";

export const metadata: Metadata = {
  title: "Admin Celebrities",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Celebrities />
    </AdminProtectedRoute>
  );
}
