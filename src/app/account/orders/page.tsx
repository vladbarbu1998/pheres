import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Orders from "@/views/account/Orders";

export const metadata: Metadata = {
  title: "My Orders",
  robots: { index: false },
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  );
}
