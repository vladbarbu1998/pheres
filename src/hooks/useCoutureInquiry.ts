import { useState, useCallback } from "react";
import { z } from "zod";

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
});

export type CoutureInquiryData = z.infer<typeof coutureInquirySchema>;

interface UseCoutureInquiryReturn {
  submit: (data: CoutureInquiryData) => Promise<void>;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  reset: () => void;
}

export function useCoutureInquiry(): UseCoutureInquiryReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: CoutureInquiryData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate data
      const validated = coutureInquirySchema.parse(data);

      // TODO: Integrate with backend (Supabase edge function or direct insert)
      // For now, simulate a successful submission
      console.log("Couture inquiry submitted:", validated);
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSuccess(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "Validation error");
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
