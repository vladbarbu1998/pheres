import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Favorites from "@/views/account/Favorites";

export const metadata: Metadata = {
  title: "My Favorites",
  robots: { index: false },
};

export default function Page() {
  return (
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  );
}
