"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { updatePassword, session, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect to login if no session after auth loads
  useEffect(() => {
    if (!authLoading && !session) {
      toast({
        title: "Session expired",
        description: "Please request a new password reset link.",
        variant: "destructive",
      });
      router.push("/account/forgot-password");
    }
  }, [authLoading, session, router, toast]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await updatePassword(data.password);
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Password updated",
          description: "Your password has been successfully reset.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Reset Password
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSuccess
                ? "Your password has been updated"
                : "Enter your new password below"}
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-muted-foreground">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Button asChild className="w-full">
                <Link href="/account/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <Link
                    href="/account/login"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;