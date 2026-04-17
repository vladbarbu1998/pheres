import type { Metadata } from "next";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import Inbox from "@/views/admin/Inbox";

export const metadata: Metadata = {
  title: "Admin Inbox",
  robots: { index: false },
};

export default function Page() {
  return (
    <AdminProtectedRoute>
      <Inbox />
    </AdminProtectedRoute>
  );
}
