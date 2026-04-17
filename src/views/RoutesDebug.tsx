"use client";

import Link from "next/link";
interface RouteInfo {
  path: string;
  label: string;
  type: "static" | "dynamic" | "redirect";
}

interface RouteGroup {
  name: string;
  routes: RouteInfo[];
}

const routeGroups: RouteGroup[] = [
  {
    name: "Main Pages",
    routes: [
      { path: "/", label: "Home", type: "static" },
      { path: "/shop", label: "Shop (Product Archive)", type: "static" },
      { path: "/story", label: "Our Story", type: "static" },
      { path: "/celebrities", label: "Celebrities", type: "static" },
      { path: "/contact", label: "Contact", type: "static" },
      { path: "/search", label: "Search Results", type: "static" },
    ],
  },
  {
    name: "Shop & Products",
    routes: [
      { path: "/shop/collection/:slug", label: "Collection Page", type: "dynamic" },
      { path: "/shop/category/:slug", label: "Category Page", type: "dynamic" },
      { path: "/shop/:categorySlug/:productSlug", label: "Product Page (new URL)", type: "dynamic" },
    ],
  },
  {
    name: "Legacy / Redirect Routes",
    routes: [
      { path: "/product/:slug", label: "Old Product URL → redirects to new", type: "redirect" },
      { path: "/shop/all", label: "Redirect → /shop", type: "redirect" },
      { path: "/shop/all/:productSlug", label: "Products without category", type: "dynamic" },
    ],
  },
  {
    name: "Cart & Checkout",
    routes: [
      { path: "/cart", label: "Cart", type: "static" },
      { path: "/checkout", label: "Checkout", type: "static" },
      { path: "/order-confirmation/:orderId", label: "Order Confirmation", type: "dynamic" },
    ],
  },
  {
    name: "Legal Pages",
    routes: [
      { path: "/privacy-policy", label: "Privacy Policy", type: "static" },
      { path: "/terms", label: "Terms & Conditions", type: "static" },
      { path: "/returns", label: "Returns & Refunds", type: "static" },
      { path: "/shipping", label: "Shipping (→ same as Returns)", type: "redirect" },
    ],
  },
  {
    name: "Account (Auth)",
    routes: [
      { path: "/account/login", label: "Login", type: "static" },
      { path: "/account/register", label: "Register", type: "static" },
      { path: "/account/forgot-password", label: "Forgot Password", type: "static" },
    ],
  },
  {
    name: "Account (Protected)",
    routes: [
      { path: "/account", label: "Account Overview", type: "static" },
      { path: "/account/orders", label: "My Orders", type: "static" },
      { path: "/account/orders/:id", label: "Order Detail", type: "dynamic" },
      { path: "/account/addresses", label: "My Addresses", type: "static" },
      { path: "/account/favorites", label: "My Favorites", type: "static" },
      { path: "/account/details", label: "Account Details", type: "static" },
    ],
  },
  {
    name: "Admin (Protected)",
    routes: [
      { path: "/admin", label: "Admin Entry / Login", type: "static" },
      { path: "/admin/products", label: "Products List", type: "static" },
      { path: "/admin/products/new", label: "New Product", type: "static" },
      { path: "/admin/products/:id", label: "Edit Product", type: "dynamic" },
      { path: "/admin/collections", label: "Collections", type: "static" },
      { path: "/admin/categories", label: "Categories", type: "static" },
      { path: "/admin/orders", label: "Orders", type: "static" },
      { path: "/admin/orders/:id", label: "Order Detail", type: "dynamic" },
      { path: "/admin/customers", label: "Customers", type: "static" },
      
      { path: "/admin/press", label: "Press Entries", type: "static" },
      { path: "/admin/inbox", label: "Contact Messages", type: "static" },
    ],
  },
];

const typeColors = {
  static: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  dynamic: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  redirect: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

export default function RoutesDebug() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Route Audit</h1>
        <p className="mb-8 text-muted-foreground">
          Internal debug page listing all routes in the application.
        </p>

        <div className="mb-6 flex gap-4 text-sm">
          <span className={`rounded px-2 py-1 ${typeColors.static}`}>Static</span>
          <span className={`rounded px-2 py-1 ${typeColors.dynamic}`}>Dynamic</span>
          <span className={`rounded px-2 py-1 ${typeColors.redirect}`}>Redirect</span>
        </div>

        <div className="space-y-8">
          {routeGroups.map((group) => (
            <div key={group.name}>
              <h2 className="mb-3 text-lg font-semibold text-foreground">{group.name}</h2>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Path</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Label</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {group.routes.map((route) => (
                      <tr key={route.path} className="hover:bg-muted/30">
                        <td className="px-4 py-2">
                          {route.type === "dynamic" ? (
                            <code className="text-xs text-muted-foreground">{route.path}</code>
                          ) : (
                            <Link
                              href={route.path}
                              className="font-mono text-xs text-primary hover:underline"
                            >
                              {route.path}
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-2 text-foreground">{route.label}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded px-2 py-0.5 text-xs ${typeColors[route.type]}`}>
                            {route.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> This page is for internal auditing only and is not linked in the public navigation.
          Remove this page when the audit is complete.
        </div>
      </div>
    </div>
  );
}