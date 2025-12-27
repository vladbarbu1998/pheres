import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ChevronLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/hooks/useAccount";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusSteps = ["pending", "paid", "processing", "shipped", "delivered"];

function OrderStatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled" || currentStatus === "refunded";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-medium capitalize">{currentStatus}</p>
          <p className="text-sm text-muted-foreground">This order has been {currentStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-4">
      {statusSteps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        const Icon = 
          step === "pending" ? Clock :
          step === "paid" ? CheckCircle :
          step === "processing" ? Package :
          step === "shipped" ? Truck :
          CheckCircle;

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  "mt-2 text-xs capitalize",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step}
              </p>
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  index < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError } = useOrder(id || "");

  if (isLoading) {
    return (
      <AccountLayout title="Order Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24" />
          <Skeleton className="h-48" />
        </div>
      </AccountLayout>
    );
  }

  if (isError || !order) {
    return (
      <AccountLayout title="Order Details">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found or could not be loaded.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/account/orders">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Order Details">
      <div className="space-y-6">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm">
          <Link to="/account/orders">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        {/* Order header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold">{order.order_number}</h2>
              <Badge
                variant="secondary"
                className={cn("capitalize", statusColors[order.status])}
              >
                {order.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <p className="font-display text-2xl font-semibold">
            ${Number(order.total).toLocaleString()}
          </p>
        </div>

        {/* Status timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusTimeline currentStatus={order.status} />
            {order.tracking_number && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm">
                  <span className="text-muted-foreground">Tracking: </span>
                  {order.tracking_url ? (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <span className="font-medium">{order.tracking_number}</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-20 w-20 shrink-0 overflow-hidden bg-secondary/50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${Number(item.total_price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order summary & addresses */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              <p className="text-muted-foreground mt-1">
                {order.shipping_address_line_1}
                {order.shipping_address_line_2 && (
                  <>, {order.shipping_address_line_2}</>
                )}
                <br />
                {order.shipping_city}
                {order.shipping_state && `, ${order.shipping_state}`}{" "}
                {order.shipping_postal_code}
                <br />
                {order.shipping_country}
              </p>
              {order.shipping_phone && (
                <p className="text-muted-foreground mt-2">{order.shipping_phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Order summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {Number(order.shipping_amount) === 0
                    ? "Free"
                    : `$${Number(order.shipping_amount).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${Number(order.tax_amount).toLocaleString()}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${Number(order.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${Number(order.total).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccountLayout>
  );
}
