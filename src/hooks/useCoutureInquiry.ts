import { useState, useCallback } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const coutureInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  preferredContact: z.enum(["email", "phone", "virtual"], {
    required_error: "Please select a preferred contact method",
  }),
  phone: z.string().optional(),
  message: z.string().max(2000, "Message must be less than 2000 characters").optional(),
  interestedInViewing: z.boolean().default(false),
  productId: z.string(),
  productName: z.string(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to continue" }),
  }),
});

export type CoutureInquiryData = z.infer<typeof coutureInquirySchema>;

interface UseCoutureInquiryReturn {
  submit: (data: CoutureInquiryData, turnstileToken: string) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

export function useCoutureInquiry(): UseCoutureInquiryReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: CoutureInquiryData, turnstileToken: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate data
      const validated = coutureInquirySchema.parse(data);

      // Verify Turnstile token server-side
      const { data: verifyResult, error: verifyError } = await supabase.functions.invoke("verify-turnstile", {
        body: { token: turnstileToken },
      });

      if (verifyError || !verifyResult?.success) {
        throw new Error("Verification failed. Please try again.");
      }

      // Insert into couture_inquiries table
      const { error: insertError } = await supabase
        .from("couture_inquiries")
        .insert({
          product_id: validated.productId,
          product_name: validated.productName,
          name: validated.name,
          email: validated.email,
          country: validated.country,
          preferred_contact: validated.preferredContact,
          phone: validated.phone || null,
          message: validated.message || null,
          interested_in_viewing: validated.interestedInViewing,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Fire-and-forget admin notification
      supabase.functions.invoke("notify-admin-form", {
        body: {
          type: "couture_inquiry",
          name: validated.name,
          email: validated.email,
          country: validated.country,
          preferredContact: validated.preferredContact,
          phone: validated.phone,
          message: validated.message,
          productName: validated.productName,
          interestedInViewing: validated.interestedInViewing,
        },
      }).catch(() => {});

      setIsSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "Validation error");
      } else if (err instanceof Error) {
        setError(err.message || "Something went wrong. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);

  return {
    submit,
    isSubmitting,
    isSuccess,
    error,
    reset,
  };
}
