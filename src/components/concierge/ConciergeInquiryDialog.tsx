import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useConciergeInquiry } from "@/hooks/useConciergeInquiry";

const conciergeInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select a country"),
  preferredContact: z.enum(["email", "phone", "virtual"], {
    required_error: "Please select a preferred contact method",
  }),
  phone: z.string().optional(),
  message: z.string().max(2000, "Message must be less than 2000 characters").optional(),
});

export type ConciergeInquiryData = z.infer<typeof conciergeInquirySchema>;

interface ConciergeInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConciergeInquiryDialog({
  open,
  onOpenChange,
}: ConciergeInquiryDialogProps) {
  const { submit, isSubmitting, isSuccess, error, reset } = useConciergeInquiry();

  const form = useForm<ConciergeInquiryData>({
    resolver: zodResolver(conciergeInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      preferredContact: "email",
      phone: "",
      message: "",
    },
  });

  const watchPreferredContact = form.watch("preferredContact");

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        form.reset();
        reset();
      }, 300);
    }
  }, [open, form, reset]);

  const onSubmit = async (data: ConciergeInquiryData) => {
    await submit(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-2xl">
            Contact Our Concierge Team
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            We're here to assist with personalized service inquiries
          </SheetDescription>
        </SheetHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              Thank You for Your Inquiry
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              Our concierge team will contact you within 1 business day.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <CountrySelect value={field.value} onValueChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preferred Contact Method */}
              <FormField
                control={form.control}
                name="preferredContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Contact Method *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="email" id="concierge-email" />
                          <label htmlFor="concierge-email" className="text-sm cursor-pointer">Email</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="phone" id="concierge-phone" />
                          <label htmlFor="concierge-phone" className="text-sm cursor-pointer">Phone</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="virtual" id="concierge-virtual" />
                          <label htmlFor="concierge-virtual" className="text-sm cursor-pointer">Virtual Appointment</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone (conditional) */}
              {watchPreferredContact === "phone" && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          placeholder="Your phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us how we can assist you..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Error Message */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Inquiry"
                )}
              </Button>

              {/* Advisor Note */}
              <p className="text-xs text-center text-muted-foreground">
                Our concierge team will contact you within 1 business day.
              </p>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
