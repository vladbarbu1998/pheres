import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCoutureInquiry, coutureInquirySchema, type CoutureInquiryData } from "@/hooks/useCoutureInquiry";

interface CoutureInquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function CoutureInquiryDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: CoutureInquiryDialogProps) {
  const { submit, isSubmitting, isSuccess, error, reset } = useCoutureInquiry();

  const form = useForm<CoutureInquiryData>({
    resolver: zodResolver(coutureInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      preferredContact: "email",
      phone: "",
      message: "",
      interestedInViewing: false,
      productId,
      productName,
    },
  });

  const watchPreferredContact = form.watch("preferredContact");

  useEffect(() => {
    if (open) {
      form.setValue("productId", productId);
      form.setValue("productName", productName);
    }
  }, [open, productId, productName, form]);

  useEffect(() => {
    if (!open) {
      // Reset form and state when dialog closes
      setTimeout(() => {
        form.reset();
        reset();
      }, 300);
    }
  }, [open, form, reset]);

  const onSubmit = async (data: CoutureInquiryData) => {
    await submit(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-2xl">
            Inquire About This Piece
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {productName}
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
              Our PHERES advisors will contact you within 1 business day to discuss this exceptional piece.
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
                          <RadioGroupItem value="email" id="email" />
                          <label htmlFor="email" className="text-sm cursor-pointer">Email</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="phone" id="phone" />
                          <label htmlFor="phone" className="text-sm cursor-pointer">Phone</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="virtual" id="virtual" />
                          <label htmlFor="virtual" className="text-sm cursor-pointer">Virtual Appointment</label>
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
                        placeholder="Tell us more about what you're looking for..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interested in Viewing */}
              <FormField
                control={form.control}
                name="interestedInViewing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal cursor-pointer">
                        I'm interested in viewing this piece in person
                      </FormLabel>
                    </div>
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
                Our PHERES advisors will contact you within 1 business day.
              </p>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
