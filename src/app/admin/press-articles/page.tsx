import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import PressArticles from "@/views/admin/PressArticles";

export const metadata: Metadata = {
  title: "Admin Press Articles",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <PressArticles />
    </AdminProtectedRoute>
  );
}
