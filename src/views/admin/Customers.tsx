"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCsv } from "@/lib/exportCsv";
import { Search, User, Mail, ShoppingBag, DollarSign, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Customer {
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  order_count: number;
  total_spent: number;
  first_order_date: string;
  last_order_date: string;
}

interface CustomerOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

// Custom hook to fetch customers from orders (not from profiles)
function useOrderCustomers() {
  return useQuery({
    queryKey: ["admin-order-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("customer_email, shipping_first_name, shipping_last_name, total, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Aggregate by email
      const customerMap = new Map<string, Customer>();
      
      for (const order of data || []) {
        const email = order.customer_email || "unknown";
        const existing = customerMap.get(email);
        const firstName = order.shipping_first_name || "";
        const lastName = order.shipping_last_name || "";
        
        if (existing) {
          existing.order_count += 1;
          existing.total_spent += Number(order.total) || 0;
          // Keep the most recent order date
          if (new Date(order.created_at) > new Date(existing.last_order_date)) {
            existing.last_order_date = order.created_at;
            // Update name if current is empty
            if (!existing.name && (firstName || lastName)) {
              existing.name = `${firstName} ${lastName}`.trim();
              existing.first_name = firstName;
              existing.last_name = lastName;
            }
          }
          // Keep the oldest order as first_order_date
          if (new Date(order.created_at) < new Date(existing.first_order_date)) {
            existing.first_order_date = order.created_at;
          }
        } else {
          customerMap.set(email, {
            email,
            name: `${firstName} ${lastName}`.trim(),
            first_name: firstName,
            last_name: lastName,
            order_count: 1,
            total_spent: Number(order.total) || 0,
            first_order_date: order.created_at,
            last_order_date: order.created_at,
          });
        }
      }

      return Array.from(customerMap.values()).sort(
        (a, b) => new Date(b.last_order_date).getTime() - new Date(a.last_order_date).getTime()
      );
    },
  });
}

export default function AdminCustomers() {
  const { data: customers, isLoading, error } = useOrderCustomers();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const filteredCustomers = customers?.filter((customer) => {
    const searchLower = search.toLowerCase();
    return (
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleExport = () => {
    if (!filteredCustomers?.length) {
      toast.error("No customers to export");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = filteredCustomers.map((customer) => ({
        customer_id: customer.email,
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        email: customer.email,
        country: "",
        total_orders: customer.order_count,
        total_spent: customer.total_spent.toFixed(2),
        first_order_date: format(new Date(customer.first_order_date), "yyyy-MM-dd HH:mm"),
        last_order_date: format(new Date(customer.last_order_date), "yyyy-MM-dd HH:mm"),
        created_at: format(new Date(customer.first_order_date), "yyyy-MM-dd HH:mm"),
      }));

      const columns = [
        { key: "customer_id" as const, header: "Customer ID" },
        { key: "first_name" as const, header: "First Name" },
        { key: "last_name" as const, header: "Last Name" },
        { key: "email" as const, header: "Email" },
        { key: "country" as const, header: "Country" },
        { key: "total_orders" as const, header: "Total Orders" },
        { key: "total_spent" as const, header: "Total Spent" },
        { key: "first_order_date" as const, header: "First Order Date" },
        { key: "last_order_date" as const, header: "Last Order Date" },
        { key: "created_at" as const, header: "Created At" },
      ];

      const filename = `pheres-customers-${format(new Date(), "yyyy-MM-dd")}.csv`;
      exportToCsv(exportData, columns, filename);
      toast.success(`Exported ${exportData.length} customers`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export customers");
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewOrders = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, created_at")
        .eq("customer_email", customer.email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomerOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load customer orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading customers. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Customers</h1>
            <p className="text-muted-foreground">Customers who have placed orders</p>
          </div>
          <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search ? "No customers match your search." : "No customers with orders yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers?.map((customer) => (
                  <TableRow key={customer.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">
                          {customer.name || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[200px]">{customer.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{customer.order_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${customer.total_spent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {format(new Date(customer.last_order_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrders(customer)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Orders
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Customer Orders Dialog */}
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Orders for {selectedCustomer?.name || selectedCustomer?.email}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {selectedCustomer?.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  {selectedCustomer?.order_count} orders
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  ${selectedCustomer?.total_spent.toLocaleString()} total
                </div>
              </div>

              {loadingOrders ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No orders found for this customer.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status === "pending" ? "Pending Payment" : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${Number(order.total).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}