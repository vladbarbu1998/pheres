"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user) {
        router.push("/account/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [authLoading, adminLoading, user, isAdmin, router]);

  if (authLoading || adminLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
