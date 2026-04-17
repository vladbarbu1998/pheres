"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRateLimit, RATE_LIMIT_PRESETS } from "@/hooks/useRateLimit";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { ConsentToggle } from "@/components/ui/consent-toggle";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to continue" }),
  }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  
  const { 
    checkRateLimit, 
    recordAttempt, 
    isRateLimited, 
    secondsUntilReset 
  } = useRateLimit(RATE_LIMIT_PRESETS.passwordReset);

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
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Check rate limit before proceeding
    if (!checkRateLimit()) {
      toast.error(`Too many reset attempts. Please wait ${Math.ceil(secondsUntilReset / 60)} minute(s).`);
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

    const { error } = await resetPassword(data.email);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container flex min-h-[70vh] items-center justify-center py-12">
          <div className="mx-auto w-full max-w-md space-y-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
                Check Your Email
              </h1>
              <p className="mt-4 text-muted-foreground">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/account/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
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
              Reset Password
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your email and we'll send you a reset link
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
              {isRateLimited ? `Wait ${Math.ceil(secondsUntilReset / 60)}m` : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/account/login"
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}