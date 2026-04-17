"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Clock, Mail } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRateLimit, RATE_LIMIT_PRESETS } from "@/hooks/useRateLimit";
import { supabase } from "@/integrations/supabase/client";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { ConsentToggle } from "@/components/ui/consent-toggle";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to continue" }),
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const { signIn, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    checkRateLimit, 
    recordAttempt, 
    isRateLimited, 
    secondsUntilReset,
    reset: resetRateLimit 
  } = useRateLimit(RATE_LIMIT_PRESETS.login);

  // Support query param redirect
  const redirectParam = searchParams?.get("redirect");
  const from = redirectParam || "/account";

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(from);
    }
  }, [user, authLoading, router, from]);

  const {
    isTokenReady,
    isVerifying,
    onVerify,
    onExpire,
    onError,
    verifyToken,
  } = useTurnstile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleResendVerification = async () => {
    const emailValue = (document.getElementById("email") as HTMLInputElement)?.value;
    if (!emailValue) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsResending(true);
    try {
      await supabase.auth.resend({
        type: "signup",
        email: emailValue,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      toast.success("Verification email sent! Please check your inbox.");
      setShowResendOption(false);
    } catch {
      toast.error("Failed to resend. Please try again.");
    }
    setIsResending(false);
  };

  const onSubmit = async (data: LoginFormData) => {
    // Check rate limit before proceeding
    if (!checkRateLimit()) {
      toast.error(`Too many login attempts. Please wait ${Math.ceil(secondsUntilReset / 60)} minute(s).`);
      return;
    }
    
    setIsLoading(true);
    recordAttempt();

    const verified = await verifyToken();
    if (!verified) {
      toast.error("Verification failed. Please try again.");
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        setShowResendOption(true);
        toast.error("Please verify your email before signing in. Check your inbox for the verification link.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Reset rate limit on successful login
    resetRateLimit();
    toast.success("Welcome back!");
    router.replace(from);
  };

  // Show loading or nothing while checking auth
  if (authLoading || user) {
    return (
      <Layout>
        <div className="container flex min-h-[70vh] items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      
      <div className="container flex min-h-[70vh] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Welcome Back
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your Pheres account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/account/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <TurnstileWidget
              onVerify={onVerify}
              onExpire={onExpire}
              onError={onError}
            />

            <ConsentToggle
              checked={watch("consent") === true}
              onCheckedChange={(checked) => setValue("consent", checked as any, { shouldValidate: true })}
              error={errors.consent?.message}
            />

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || isRateLimited || !isTokenReady || !watch("consent") || isVerifying}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isRateLimited ? (
                <Clock className="mr-2 h-4 w-4" />
              ) : null}
              {isRateLimited ? `Wait ${Math.ceil(secondsUntilReset / 60)}m` : "Sign In"}
            </Button>

            {showResendOption && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Resend Verification Email
              </Button>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/account/register"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}