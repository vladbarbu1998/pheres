import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminOrder } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Mail } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"];

const getStatusLabel = (status: string) =>
  status === "pending" ? "Pending Payment" : status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Shipping details for "shipped" status
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  // Function to send order status email
  const sendOrderEmail = async (orderId: string, status: string, previousStatus?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("order-emails", {
        body: {
          order_id: orderId,
          status,
          previous_status: previousStatus,
          notify_admin: status === "pending",
        },
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Failed to send order email:", error);
      throw error;
    }
  };

  const handleStatusChange = (status: OrderStatus) => {
    setNewStatus(status);
    // Pre-fill shipping details from existing order data
    if (status === "shipped" && order) {
      setCarrier(order.carrier || "");
      setTrackingNumber(order.tracking_number || "");
      setTrackingUrl(order.tracking_url || "");
    }
    setShowConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (!newStatus || !id) return;

    const previousStatus = order?.status;
    setIsUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "shipped") {
        updateData.shipped_at = new Date().toISOString();
        updateData.carrier = carrier.trim() || null;
        updateData.tracking_number = trackingNumber.trim() || null;
        updateData.tracking_url = trackingUrl.trim() || null;
      } else if (newStatus === "delivered") {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase.from("orders").update(updateData).eq("id", id);

      if (error) throw error;

      // Send email notification if enabled
      if (sendEmail) {
        try {
          await sendOrderEmail(id, newStatus, previousStatus);
          toast.success(`Order status updated to ${newStatus} and email sent`);
        } catch (emailError) {
          console.error("Email failed:", emailError);
          toast.success(`Order status updated to ${newStatus}`, {
            description: "Email notification failed to send",
          });
        }
      } else {
        toast.success(`Order status updated to ${newStatus}`);
      }

      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
      setShowConfirm(false);
      setNewStatus(null);
    }
  };

  // Manual email resend
  const handleResendEmail = async () => {
    if (!order) return;
    
    setIsSendingEmail(true);
    try {
      await sendOrderEmail(order.id, order.status);
      toast.success("Email sent successfully");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Order Details" backLink="/admin/orders">
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      </AdminLayout>
    );
  }

  if (isError || !order) {
    return (
      <AdminLayout title="Order Details" backLink="/admin/orders">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load order.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Order ${order.order_number}`}
      description={`Placed on ${format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}`}
      backLink="/admin/orders"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-3 border rounded-lg">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-xs">
                        No img
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      {item.variant_name && (
                        <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        ${Number(item.unit_price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">${Number(item.total_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${Number(order.shipping_amount).toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${Number(order.tax_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">
                {order.shipping_first_name} {order.shipping_last_name}
              </p>
              {order.customer_email && (
                <p className="text-muted-foreground">{order.customer_email}</p>
              )}
              {order.shipping_phone && (
                <p className="text-muted-foreground">{order.shipping_phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {order.shipping_address_line_1}
                {order.shipping_address_line_2 && <>, {order.shipping_address_line_2}</>}
              </p>
              <p className="text-muted-foreground">
                {order.shipping_city}
                {order.shipping_state && `, ${order.shipping_state}`} {order.shipping_postal_code}
              </p>
              <p className="text-muted-foreground">{order.shipping_country}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span>Current:</span>
                <Badge className={statusColors[order.status] || ""}>{getStatusLabel(order.status)}</Badge>
              </div>
              <div className="space-y-2">
                <Label>Change Status</Label>
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {getStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {order.shipped_at && (
                <p className="text-sm text-muted-foreground">
                  Shipped: {format(new Date(order.shipped_at), "MMM d, yyyy")}
                </p>
              )}
              {order.delivered_at && (
                <p className="text-sm text-muted-foreground">
                  Delivered: {format(new Date(order.delivered_at), "MMM d, yyyy")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send order status email to the customer.
              </p>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isSendingEmail}
                className="w-full"
              >
                {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resend Status Email
              </Button>
            </CardContent>
          </Card>

          {/* Tracking */}
          {(order.tracking_number || order.tracking_url) && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {order.tracking_number && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Number:</span> {order.tracking_number}
                  </p>
                )}
                {order.tracking_url && (
                  <a
                    href={order.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Track Package →
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(order.customer_notes || order.admin_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.customer_notes && (
                  <div>
                    <p className="text-sm font-medium">Customer Note</p>
                    <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                  </div>
                )}
                {order.admin_notes && (
                  <div>
                    <p className="text-sm font-medium">Admin Note</p>
                    <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change order status?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update the order status to "{newStatus}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          {newStatus === "shipped" && (
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="carrier">Carrier</Label>
                <Input
                  id="carrier"
                  placeholder="e.g. DHL, FedEx, UPS"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tracking-number">Tracking Number</Label>
                <Input
                  id="tracking-number"
                  placeholder="e.g. 1Z999AA10123456784"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tracking-url">Tracking URL</Label>
                <Input
                  id="tracking-url"
                  placeholder="https://..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="send-email"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <label
              htmlFor="send-email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send email notification to customer
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
