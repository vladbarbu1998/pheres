"use client";

import Link from "next/link";
import { Package, MapPin, Heart, ArrowRight } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useOrders, useAddresses, useFavorites } from "@/hooks/useAccount";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-display font-semibold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AccountOverview() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: favorites, isLoading: favoritesLoading } = useFavorites();

  const isLoading = profileLoading || ordersLoading || addressesLoading || favoritesLoading;

  const firstName = profile?.first_name || user?.user_metadata?.first_name || "there";
  const recentOrder = orders?.[0];

  return (
    <AccountLayout 
      title="My Account" 
      description="Manage your orders, addresses, and preferences"
      isLoading={isLoading}
    >
      {/* Greeting */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground">
          Hello, {firstName}
        </h2>
        <p className="mt-1 text-muted-foreground">
          Welcome to your <span className="brand-word">Pheres</span> account dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Orders"
          value={orders?.length || 0}
          description={
            recentOrder
              ? `Last order: ${format(new Date(recentOrder.created_at), "MMM d, yyyy")}`
              : "No orders yet"
          }
          icon={Package}
          href="/account/orders"
        />
        <StatCard
          title="Addresses"
          value={addresses?.length || 0}
          description={
            addresses?.length
              ? `${addresses.filter((a) => a.is_default).length} default`
              : "No addresses saved"
          }
          icon={MapPin}
          href="/account/addresses"
        />
        <StatCard
          title="Favorites"
          value={favorites?.length || 0}
          description="Items in your wishlist"
          icon={Heart}
          href="/account/favorites"
        />
      </div>

      {/* Recent Order */}
      {recentOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Most Recent Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{recentOrder.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(recentOrder.created_at), "MMMM d, yyyy")} •{" "}
                  <span className="capitalize">{recentOrder.status}</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-display font-semibold">
                  ${Number(recentOrder.total).toLocaleString()}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/account/orders/${recentOrder.id}`}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/shop">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/account/orders">View All Orders</Link>
        </Button>
      </div>
    </AccountLayout>
  );
}