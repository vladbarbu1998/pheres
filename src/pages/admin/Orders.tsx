import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminOrders } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { exportToCsv } from "@/lib/exportCsv";
import { Search, Eye, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function AdminOrders() {
  const { data: orders, isLoading, isError, refetch } = useAdminOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_first_name?.toLowerCase().includes(search.toLowerCase()) ||
      order.shipping_last_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async () => {
    if (!filteredOrders?.length) {
      toast.error("No orders to export");
      return;
    }

    setIsExporting(true);
    try {
      // Fetch order items for all filtered orders
      const orderIds = filteredOrders.map((o) => o.id);
      const { data: orderItems, error } = await supabase
        .from("order_items")
        .select("order_id, product_name, sku, quantity")
        .in("order_id", orderIds);

      if (error) throw error;

      // Group items by order
      const itemsByOrder = (orderItems || []).reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(`${item.sku || item.product_name} x${item.quantity}`);
        return acc;
      }, {} as Record<string, string[]>);

      // Prepare export data
      const exportData = filteredOrders.map((order) => ({
        order_id: order.order_number,
        order_date: format(new Date(order.created_at), "yyyy-MM-dd HH:mm"),
        status: order.status,
        customer_name: `${order.shipping_first_name || ""} ${order.shipping_last_name || ""}`.trim(),
        customer_email: order.customer_email || "",
        billing_country: order.billing_country || "",
        shipping_country: order.shipping_country || "",
        payment_method: order.payment_method || "",
        shipping_method: "",
        subtotal: Number(order.subtotal).toFixed(2),
        discount_total: Number(order.discount_amount).toFixed(2),
        tax_total: Number(order.tax_amount).toFixed(2),
        shipping_total: Number(order.shipping_amount).toFixed(2),
        grand_total: Number(order.total).toFixed(2),
        products: itemsByOrder[order.id]?.join("; ") || "",
      }));

      const columns = [
        { key: "order_id" as const, header: "Order ID" },
        { key: "order_date" as const, header: "Order Date" },
        { key: "status" as const, header: "Status" },
        { key: "customer_name" as const, header: "Customer Name" },
        { key: "customer_email" as const, header: "Customer Email" },
        { key: "billing_country" as const, header: "Billing Country" },
        { key: "shipping_country" as const, header: "Shipping Country" },
        { key: "payment_method" as const, header: "Payment Method" },
        { key: "shipping_method" as const, header: "Shipping Method" },
        { key: "subtotal" as const, header: "Subtotal" },
        { key: "discount_total" as const, header: "Discount Total" },
        { key: "tax_total" as const, header: "Tax Total" },
        { key: "shipping_total" as const, header: "Shipping Total" },
        { key: "grand_total" as const, header: "Grand Total" },
        { key: "products" as const, header: "Products" },
      ];

      const filename = `pheres-orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
      exportToCsv(exportData, columns, filename);
      toast.success(`Exported ${exportData.length} orders`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export orders");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout title="Orders" description="Manage customer orders">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load orders.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search || statusFilter !== "all" ? "No orders match your filters." : "No orders yet."}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead className="hidden sm:table-cell">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <span className="font-medium">{order.order_number}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.shipping_first_name} {order.shipping_last_name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(order.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] || ""}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/orders/${order.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AdminLayout>
  );
}
