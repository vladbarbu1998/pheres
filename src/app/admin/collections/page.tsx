import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Collections from "@/views/admin/Collections";

export const metadata: Metadata = {
  title: "Admin Collections",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Collections />
    </AdminProtectedRoute>
  );
}
