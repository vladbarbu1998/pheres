import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShoppingBag, Pencil } from "lucide-react";
import { AddressFormDialog, type Address } from "@/components/address/AddressFormDialog";
import { Layout } from "@/components/layout/Layout";
import { CartCheckoutLayout } from "@/components/cart/CartCheckoutLayout";
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
import { trackBeginCheckout, type AnalyticsProduct } from "@/hooks/useAnalytics";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { ConsentToggle } from "@/components/ui/consent-toggle";

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
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to continue" }),
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, isLoading: cartLoading, subtotal } = useCart();
  const { data: profile } = useProfile();
  const { data: addresses } = useAddresses();
  
  const {
    isTokenReady,
    isVerifying,
    onVerify,
    onExpire,
    onError,
    verifyToken,
  } = useTurnstile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Honeypot fields for bot detection - bots will fill these hidden fields
  const [honeypotName, setHoneypotName] = useState("");
  const [honeypotEmail, setHoneypotEmail] = useState("");
  const formStartTime = useRef(Date.now());

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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
    
    // Check honeypot fields - if filled, it's likely a bot
    if (honeypotName || honeypotEmail) {
      // Silently reject but show generic success to avoid revealing detection
      console.log("Honeypot triggered - potential bot detected");
      toast.success("Order placed successfully!");
      return;
    }
    
    // Check if form was filled too quickly (less than 3 seconds) - likely a bot
    const timeSpent = Date.now() - formStartTime.current;
    if (timeSpent < 3000) {
      console.log("Form submitted too quickly - potential bot detected");
      toast.success("Order placed successfully!");
      return;
    }
    
    setIsSubmitting(true);

    const verified = await verifyToken();
    if (!verified) {
      toast.error("Verification failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Track begin_checkout for GA4
    const analyticsItems: AnalyticsProduct[] = items.map(item => ({
      id: item.productId,
      name: item.product.name,
      price: item.product.base_price + (item.variant?.price_adjustment || 0),
      variant: item.variant?.name || null,
      quantity: item.quantity
    }));
    trackBeginCheckout(analyticsItems, subtotal);

    try {
      const cartPayload = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      // Step 1: Create order with stripe payment method
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
          payment_method: "stripe",
          // Honeypot data for server-side validation
          _hp_name: honeypotName,
          _hp_email: honeypotEmail,
          _hp_time: timeSpent,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create order");
      }

      if (!result?.success) {
        throw new Error(result?.error || "Failed to create order");
      }

      // Step 2: Create Stripe Checkout Session
      const { data: sessionResult, error: sessionError } = await supabase.functions.invoke("create-checkout-session", {
        body: { order_id: result.order_id },
      });

      if (sessionError) {
        throw new Error(sessionError.message || "Failed to create payment session");
      }

      if (!sessionResult?.checkout_url) {
        throw new Error("Failed to get payment URL");
      }

      // Step 3: Redirect to Stripe Checkout
      window.location.href = sessionResult.checkout_url;
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
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

  const leftContent = (
    <>
      {/* Honeypot fields - hidden from users, visible to bots */}
      <div 
        aria-hidden="true" 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          width: '1px', 
          height: '1px', 
          overflow: 'hidden' 
        }}
      >
        <label htmlFor="hp_name">Leave this empty</label>
        <input
          type="text"
          id="hp_name"
          name="hp_name"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotName}
          onChange={(e) => setHoneypotName(e.target.value)}
        />
        <label htmlFor="hp_email">Leave this empty</label>
        <input
          type="email"
          id="hp_email"
          name="hp_email"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotEmail}
          onChange={(e) => setHoneypotEmail(e.target.value)}
        />
      </div>

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
              key={`address-group-${selectedAddressId}`}
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAddress(address as Address);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit address</span>
                  </Button>
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

        {/* Address form - always shown, readonly when using saved address */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipping_first_name">First Name</Label>
              <Input
                id="shipping_first_name"
                {...register("shipping_first_name")}
                className={errors.shipping_first_name ? "border-destructive" : ""}
                readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
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
                readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
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
              readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
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
              readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipping_city">City</Label>
              <Input
                id="shipping_city"
                {...register("shipping_city")}
                className={errors.shipping_city ? "border-destructive" : ""}
                readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
              />
              {errors.shipping_city && (
                <p className="text-sm text-destructive">{errors.shipping_city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_state">State / Province (optional)</Label>
              <Input
                id="shipping_state"
                {...register("shipping_state")}
                readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="shipping_postal_code">Postal Code</Label>
              <Input
                id="shipping_postal_code"
                {...register("shipping_postal_code")}
                className={errors.shipping_postal_code ? "border-destructive" : ""}
                readOnly={selectedAddressId !== "new" && selectedAddressId !== null}
              />
              {errors.shipping_postal_code && (
                <p className="text-sm text-destructive">{errors.shipping_postal_code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping_country">Country</Label>
              {selectedAddressId !== "new" && selectedAddressId !== null ? (
                <Input
                  id="shipping_country_display"
                  value={watch("shipping_country") || ""}
                  readOnly
                />
              ) : (
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
              )}
              {errors.shipping_country && (
                <p className="text-sm text-destructive">{errors.shipping_country.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phone (optional)</Label>
            {selectedAddressId !== "new" && selectedAddressId !== null ? (
              <Input
                id="shipping_phone_display"
                value={watch("shipping_phone") || ""}
                readOnly
                placeholder="Phone number"
              />
            ) : (
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
            )}
          </div>
        </div>
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

      {/* Payment */}
      <section className="space-y-4 rounded-lg border p-6 bg-muted/30">
        <h2 className="font-display text-xl font-medium">
          Payment
        </h2>
        <p className="text-sm text-muted-foreground">
          You will be redirected to Stripe's secure checkout to complete your payment.
        </p>
      </section>

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
    </>
  );

  const rightContent = (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="font-display text-xl font-medium mb-4">Order Summary</h2>

      {/* Items */}
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {items.map((item) => {
          const price = item.product.base_price + (item.variant?.price_adjustment || 0);
          return (
            <div key={item.id} className="flex gap-4">
              <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
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
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.variant && <span>{item.variant.name} · </span>}
                  Qty: {item.quantity}
                </p>
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
        disabled={isSubmitting || !isTokenReady || !watch("consent") || isVerifying}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting to payment...
          </>
        ) : (
          "Proceed to Payment"
        )}
      </Button>
    </div>
  );

  return (
    <CartCheckoutLayout
      title="Checkout"
      backLink={{ to: "/cart", label: "Back to Cart" }}
      leftContent={leftContent}
      rightContent={rightContent}
      extraContent={
        <AddressFormDialog
          address={editingAddress}
          open={!!editingAddress}
          onOpenChange={(open) => !open && setEditingAddress(null)}
        />
      }
      formProps={{ onSubmit: handleSubmit(onSubmit) }}
    />
  );
}
