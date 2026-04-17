import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Overview from "@/views/account/Overview";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false },
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Overview />
    </ProtectedRoute>
  );
}
