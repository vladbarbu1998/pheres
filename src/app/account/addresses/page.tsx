import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Addresses from "@/views/account/Addresses";

export const metadata: Metadata = {
  title: "My Addresses",
  robots: { index: false },
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Addresses />
    </ProtectedRoute>
  );
}
