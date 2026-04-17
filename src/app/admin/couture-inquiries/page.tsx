import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import CoutureInquiries from "@/views/admin/CoutureInquiries";

export const metadata: Metadata = {
  title: "Admin Couture Inquiries",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <CoutureInquiries />
    </AdminProtectedRoute>
  );
}
