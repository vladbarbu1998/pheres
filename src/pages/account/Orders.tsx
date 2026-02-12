import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Package, ArrowRight } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/useAccount";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function OrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useOrders();

  return (
    <AccountLayout title="Orders" description="View and track your orders" isLoading={isLoading}>
      {isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Something went wrong loading your orders.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : orders?.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold">No orders yet</h3>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            When you place your first order, it will appear here.
          </p>
          <Button asChild className="mt-6">
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map((order) => (
            <Link
              key={order.id}
              to={`/account/orders/${order.id}`}
              className="block rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{order.order_number}</p>
                    <Badge
                      variant="secondary"
                      className={cn("capitalize", statusColors[order.status])}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-display text-lg font-semibold">
                    ${Number(order.total).toLocaleString()}
                  </p>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
