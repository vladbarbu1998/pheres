import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { ChevronLeft, Package, Truck, CheckCircle, Clock, XCircle, Check } from "lucide-react";
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
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const getStatusLabel = (status: string) =>
  status === "pending" ? "Pending Payment" : status.charAt(0).toUpperCase() + status.slice(1);

const statusSteps = ["pending", "paid", "shipped", "delivered"];

// Compact horizontal status indicator for mobile
function MobileStatusIndicator({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled" || currentStatus === "refunded";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-2">
        <XCircle className="h-4 w-4 text-destructive shrink-0" />
        <span className="text-sm capitalize text-destructive font-medium">
          Order {currentStatus}
        </span>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex flex-wrap items-center gap-1">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-0.5 mx-0.5",
                    index < currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 capitalize">
        Current: <span className="font-medium text-foreground">{getStatusLabel(currentStatus)}</span>
      </p>
    </div>
  );
}

// Desktop status timeline (original)
function DesktopStatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled" || currentStatus === "refunded";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 shrink-0">
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
          step === "shipped" ? Truck :
          CheckCircle;

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors shrink-0",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  "mt-2 text-xs text-center",
                  isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {getStatusLabel(step)}
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

  if (isError || (!isLoading && !order)) {
    return (
      <AccountLayout title="Order Details" isLoading={false}>
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Order not found.</p>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/account/orders">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Order Details" isLoading={isLoading}>
      {order && (
      <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="h-8 px-2">
          <Link to="/account/orders">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>

        {/* Order header - compact on mobile */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-base sm:text-xl font-semibold">{order.order_number}</h2>
            <Badge
              variant="secondary"
              className={cn("capitalize text-xs", statusColors[order.status])}
            >
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              {format(new Date(order.created_at), "MMM d, yyyy")}
            </p>
            <p className="font-display font-semibold">
              ${Number(order.total).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status - Mobile: compact indicator, Desktop: full timeline */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="py-2 sm:py-4">
            {/* Mobile: compact status */}
            <div className="sm:hidden">
              <MobileStatusIndicator currentStatus={order.status} />
            </div>
            {/* Desktop: full timeline */}
            <div className="hidden sm:block">
              <DesktopStatusTimeline currentStatus={order.status} />
            </div>
            
            {order.tracking_number && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs sm:text-sm">
                  <span className="text-muted-foreground">Tracking: </span>
                  {order.tracking_url ? (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline break-all"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <span className="font-medium break-all">{order.tracking_number}</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order items - compact cards */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-base">Items ({order.order_items?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="py-0 sm:py-2">
            <div className="divide-y divide-border">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-3">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded bg-secondary/50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="font-medium text-sm leading-tight line-clamp-2">{item.product_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      {item.variant_name && <span>{item.variant_name}</span>}
                      <span>×{item.quantity}</span>
                    </div>
                  </div>
                  <p className="font-medium text-sm shrink-0 self-center">
                    ${Number(item.total_price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping address - compact */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-base">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3 sm:py-2 sm:pb-4 text-sm">
            <p className="font-medium text-sm">
              {order.shipping_first_name} {order.shipping_last_name}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 leading-relaxed">
              {order.shipping_address_line_1}
              {order.shipping_address_line_2 && `, ${order.shipping_address_line_2}`}
              <br />
              {order.shipping_city}
              {order.shipping_state && `, ${order.shipping_state}`} {order.shipping_postal_code}
              <br />
              {order.shipping_country}
            </p>
            {order.shipping_phone && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{order.shipping_phone}</p>
            )}
          </CardContent>
        </Card>

        {/* Order summary - compact */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 sm:py-4">
            <CardTitle className="text-sm sm:text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3 sm:py-2 sm:pb-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {Number(order.shipping_amount) === 0
                  ? "Free"
                  : `$${Number(order.shipping_amount).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax_amount).toLocaleString()}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-green-600">
                <span>Discount</span>
                <span>-${Number(order.discount_amount).toLocaleString()}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-sm sm:text-base">
              <span>Total</span>
              <span>${Number(order.total).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer notes if any */}
        {order.customer_notes && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3 sm:py-4">
              <CardTitle className="text-sm sm:text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="py-0 pb-3 sm:py-2 sm:pb-4">
              <p className="text-xs sm:text-sm text-muted-foreground">{order.customer_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </AccountLayout>
  );
}
