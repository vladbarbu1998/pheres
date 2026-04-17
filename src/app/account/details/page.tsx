import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Details from "@/views/account/Details";

export const metadata: Metadata = {
  title: "Account Details",
  robots: { index: false },
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Details />
    </ProtectedRoute>
  );
}
