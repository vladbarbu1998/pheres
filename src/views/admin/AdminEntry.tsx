"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { ConsentToggle } from "@/components/ui/consent-toggle";
import AdminDashboard from "./Dashboard";

export default function AdminEntry() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    isTokenReady,
    isVerifying,
    onVerify,
    onExpire,
    onError: onTurnstileError,
    verifyToken,
  } = useTurnstile();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const verified = await verifyToken();
      if (!verified) {
        setError("Verification failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Auth state change will handle the rest
      toast.success("Welcome back");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || (user && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User is logged in but not admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access the admin area.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              Return to Homepage
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut();
                toast.success("Signed out");
              }}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is admin - show dashboard
  if (user && isAdmin) {
    return <AdminDashboard />;
  }

  // Not logged in - show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Sign in to access the Pheres admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pheres.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <TurnstileWidget
              onVerify={onVerify}
              onExpire={onExpire}
              onError={onTurnstileError}
            />

            <ConsentToggle
              checked={consent}
              onCheckedChange={setConsent}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !isTokenReady || !consent || isVerifying}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}