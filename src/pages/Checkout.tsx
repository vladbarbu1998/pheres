import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useAddresses } from "@/hooks/useAccount";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  shipping_first_name: z.string().min(1, "First name is required"),
  shipping_last_name: z.string().min(1, "Last name is required"),
  shipping_address_line_1: z.string().min(1, "Address is required"),
  shipping_address_line_2: z.string().optional(),
  shipping_city: z.string().min(1, "City is required"),
  shipping_state: z.string().optional(),
  shipping_postal_code: z.string().min(1, "Postal code is required"),
  shipping_country: z.string().min(1, "Country is required"),
  shipping_phone: z.string().optional(),
  customer_notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, isLoading: cartLoading, subtotal, clearCart } = useCart();
  const { data: profile } = useProfile();
  const { data: addresses } = useAddresses();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      shipping_country: "United States",
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toast.info("Your cart is empty");
      navigate("/cart");
    }
  }, [cartLoading, items, navigate]);

  // Prefill profile data
  useEffect(() => {
    if (profile) {
      setValue("email", profile.email || "");
      if (profile.first_name) setValue("shipping_first_name", profile.first_name);
      if (profile.last_name) setValue("shipping_last_name", profile.last_name);
      if (profile.phone) setValue("shipping_phone", profile.phone);
    }
  }, [profile, setValue]);

  // Set default address when addresses load
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      // Only set default if no address is currently selected
      if (selectedAddressId === null) {
        const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } else if (addresses && addresses.length === 0) {
      // No saved addresses, default to new
      setSelectedAddressId("new");
    }
  }, [addresses]);

  // Prefill address fields when selection changes
  useEffect(() => {
    if (selectedAddressId && selectedAddressId !== "new" && addresses) {
      const address = addresses.find((a) => a.id === selectedAddressId);
      if (address) {
        setValue("shipping_first_name", address.first_name);
        setValue("shipping_last_name", address.last_name);
        setValue("shipping_address_line_1", address.address_line_1);
        setValue("shipping_address_line_2", address.address_line_2 || "");
        setValue("shipping_city", address.city);
        setValue("shipping_state", address.state || "");
        setValue("shipping_postal_code", address.postal_code);
        setValue("shipping_country", address.country);
        setValue("shipping_phone", address.phone || "");
      }
    }
  }, [selectedAddressId, addresses, setValue]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const cartPayload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const { data: result, error } = await supabase.functions.invoke("create-order", {
        body: {
          customer_email: data.email,
          shipping_address: {
            first_name: data.shipping_first_name,
            last_name: data.shipping_last_name,
            address_line_1: data.shipping_address_line_1,
            address_line_2: data.shipping_address_line_2,
            city: data.shipping_city,
            state: data.shipping_state,
            postal_code: data.shipping_postal_code,
            country: data.shipping_country,
            phone: data.shipping_phone,
          },
          cart_items: cartPayload,
          customer_notes: data.customer_notes,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create order");
      }

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create order");
      }

      // Clear local cart (server already cleared DB cart)
      await clearCart();

      // Redirect to confirmation
      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${result.order_id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // TODO: Shipping and tax calculation
  const shippingAmount = 0;
  const taxAmount = 0;
  const total = subtotal + shippingAmount + taxAmount;

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-8 lg:py-12">
        <Link
          to="/cart"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left Column - Customer Info & Address */}
            <div className="space-y-8">
              {/* Contact */}
              <section className="space-y-4">
                <h2 className="font-display text-xl font-medium">Contact</h2>
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
              </section>

              <Separator />

              {/* Shipping Address */}
              <section className="space-y-4">
                <h2 className="font-display text-xl font-medium">Shipping Address</h2>

                {/* Address selector for logged-in users with addresses */}
                {user && addresses && addresses.length > 0 && selectedAddressId !== null && (
                  <div className="space-y-3">
                    <Label>Saved Addresses</Label>
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={(val) => setSelectedAddressId(val as string | "new")}
                      className="space-y-2"
                    >
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`flex items-start space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                            selectedAddressId === address.id 
                              ? "border-primary bg-primary/5" 
                              : "hover:bg-accent/50"
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                          <label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <p className="font-medium">
                              {address.first_name} {address.last_name}
                              {address.label && (
                                <span className="ml-2 text-muted-foreground">({address.label})</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.address_line_1}, {address.city}, {address.postal_code}
                            </p>
                          </label>
                        </div>
                      ))}
                      <div
                        className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedAddressId === "new" 
                            ? "border-primary bg-primary/5" 
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => setSelectedAddressId("new")}
                      >
                        <RadioGroupItem value="new" id="new-address" />
                        <label htmlFor="new-address" className="cursor-pointer font-medium">
                          Enter a new address
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* Address form */}
                {(selectedAddressId === "new" || !addresses?.length) && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="shipping_first_name">First Name</Label>
                        <Input
                          id="shipping_first_name"
                          {...register("shipping_first_name")}
                          className={errors.shipping_first_name ? "border-destructive" : ""}
                        />
                        {errors.shipping_first_name && (
                          <p className="text-sm text-destructive">{errors.shipping_first_name.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping_last_name">Last Name</Label>
                        <Input
                          id="shipping_last_name"
                          {...register("shipping_last_name")}
                          className={errors.shipping_last_name ? "border-destructive" : ""}
                        />
                        {errors.shipping_last_name && (
                          <p className="text-sm text-destructive">{errors.shipping_last_name.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_address_line_1">Address</Label>
                      <Input
                        id="shipping_address_line_1"
                        placeholder="Street address"
                        {...register("shipping_address_line_1")}
                        className={errors.shipping_address_line_1 ? "border-destructive" : ""}
                      />
                      {errors.shipping_address_line_1 && (
                        <p className="text-sm text-destructive">{errors.shipping_address_line_1.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_address_line_2">Apartment, suite, etc. (optional)</Label>
                      <Input
                        id="shipping_address_line_2"
                        {...register("shipping_address_line_2")}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="shipping_city">City</Label>
                        <Input
                          id="shipping_city"
                          {...register("shipping_city")}
                          className={errors.shipping_city ? "border-destructive" : ""}
                        />
                        {errors.shipping_city && (
                          <p className="text-sm text-destructive">{errors.shipping_city.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping_state">State / Province (optional)</Label>
                        <Input id="shipping_state" {...register("shipping_state")} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="shipping_postal_code">Postal Code</Label>
                        <Input
                          id="shipping_postal_code"
                          {...register("shipping_postal_code")}
                          className={errors.shipping_postal_code ? "border-destructive" : ""}
                        />
                        {errors.shipping_postal_code && (
                          <p className="text-sm text-destructive">{errors.shipping_postal_code.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping_country">Country</Label>
                        <Controller
                          control={control}
                          name="shipping_country"
                          render={({ field }) => (
                            <CountrySelect
                              value={field.value}
                              onValueChange={field.onChange}
                              error={!!errors.shipping_country}
                            />
                          )}
                        />
                        {errors.shipping_country && (
                          <p className="text-sm text-destructive">{errors.shipping_country.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Phone (optional)</Label>
                      <Controller
                        control={control}
                        name="shipping_phone"
                        render={({ field }) => (
                          <PhoneInput
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            placeholder="Phone number"
                          />
                        )}
                      />
                    </div>
                  </div>
                )}
              </section>

              <Separator />

              {/* Order Notes */}
              <section className="space-y-4">
                <h2 className="font-display text-xl font-medium">Order Notes (optional)</h2>
                <Textarea
                  placeholder="Any special instructions for your order..."
                  {...register("customer_notes")}
                  rows={3}
                />
              </section>

              {/* TODO: Payment Section */}
              <section className="space-y-4 rounded-lg border border-dashed p-6 bg-muted/30">
                <h2 className="font-display text-xl font-medium text-muted-foreground">
                  Payment
                </h2>
                <p className="text-sm text-muted-foreground">
                  Payment integration coming soon. Orders will be marked as pending.
                </p>
              </section>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="font-display text-xl font-medium mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {items.map((item) => {
                    const price = item.product.base_price + (item.variant?.price_adjustment || 0);
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                          )}
                        </div>
                        <p className="font-medium">{formatPrice(price * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingAmount === 0 ? "Calculated at next step" : formatPrice(shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{taxAmount === 0 ? "Calculated at next step" : formatPrice(taxAmount)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}