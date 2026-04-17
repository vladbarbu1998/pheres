"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { ConsentToggle } from "@/components/ui/consent-toggle";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email address").max(255),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to continue" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { signUp, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/account");
    }
  }, [user, authLoading, router]);

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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    const verified = await verifyToken();
    if (!verified) {
      toast.error("Verification failed. Please try again.");
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(data.email, data.password, {
      first_name: data.firstName,
      last_name: data.lastName,
    });
    setIsLoading(false);

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message);
      }
      return;
    }

    // Show confirmation screen instead of redirecting
    setRegisteredEmail(data.email);
    setRegistrationComplete(true);
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

  // Show confirmation screen after successful registration
  if (registrationComplete) {
    return (
      <Layout>
        <div className="container flex min-h-[70vh] items-center justify-center py-12">
          <div className="mx-auto w-full max-w-md space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Check Your Email
              </h1>
              <p className="text-muted-foreground">
                We've sent a verification link to
              </p>
              <p className="font-medium text-foreground">{registeredEmail}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-left text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Open your email inbox</li>
                    <li>Click the verification link in our email</li>
                    <li>Return here to sign in</li>
                  </ol>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setRegistrationComplete(false)}
                className="font-medium text-foreground underline hover:text-primary"
              >
                try again
              </button>
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/account/login">Go to Sign In</Link>
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
              Create Account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Join the Pheres experience
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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
              <Label htmlFor="password">Password</Label>
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
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, and a number
              </p>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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

            <Button type="submit" className="w-full" size="lg" disabled={isLoading || !isTokenReady || !watch("consent") || isVerifying}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
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