import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Package, Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { trackPurchase, type AnalyticsOrder } from "@/hooks/useAnalytics";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const hasTrackedPurchase = useRef(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order-confirmation", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    // Poll every 3s while payment is still pending (webhook may not have fired yet)
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.payment_status !== "paid" && data.status !== "paid") {
        return 3000;
      }
      return false;
    },
  });

  // Track purchase event (only once per order)
  useEffect(() => {
    if (order && !hasTrackedPurchase.current) {
      hasTrackedPurchase.current = true;
      
      const analyticsOrder: AnalyticsOrder = {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        subtotal: order.subtotal,
        shipping: order.shipping_amount,
        tax: order.tax_amount,
        discount: order.discount_amount || 0,
        items: (order.order_items || []).map((item: any) => ({
          id: item.product_id || item.id,
          name: item.product_name,
          price: item.unit_price,
          quantity: item.quantity,
          variant: item.variant_name || null
        }))
      };
      
      trackPurchase(analyticsOrder);
    }
  }, [order]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (isError || !order) {
    return (
      <Layout>
        <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find this order. It may have been moved or deleted.
          </p>
          <Button asChild>
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-12 lg:py-16">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">
            Thank You for Your Order!
          </h1>
          <p className="text-muted-foreground">
            {order.payment_status === "paid" || order.status === "paid"
              ? "Your payment has been received. We'll begin processing your order shortly."
              : "Your order has been created. Payment is being processed."}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="rounded-lg border bg-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-display text-lg font-semibold">{order.order_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              {order.payment_status === "paid" || order.status === "paid" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Payment Received
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  <Package className="h-3.5 w-3.5" />
                  Payment Pending
                </span>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
            <p className="text-sm">
              {order.shipping_first_name} {order.shipping_last_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_address_line_1}
              {order.shipping_address_line_2 && `, ${order.shipping_address_line_2}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.shipping_city}
              {order.shipping_state && `, ${order.shipping_state}`} {order.shipping_postal_code}
            </p>
            <p className="text-sm text-muted-foreground">{order.shipping_country}</p>
          </div>

          {/* Order Items */}
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-sm">{formatPrice(item.total_price)}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(order.shipping_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(order.tax_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_amount)}</span>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Confirmation Email Note */}
        <div className="text-center text-sm text-muted-foreground mb-8">
          <p>
            A confirmation email has been sent to{" "}
            <span className="font-medium text-foreground">{order.customer_email}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/account/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/shop">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
