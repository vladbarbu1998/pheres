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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAdminProducts } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { exportToCsv } from "@/lib/exportCsv";
import { toast } from "sonner";
import { Plus, Search, Trash2, Pencil, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminProducts() {
  const { data: products, isLoading, isError, refetch } = useAdminProducts();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.slug.toLowerCase().includes(search.toLowerCase()) ||
      (product.product_number?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const handleExport = () => {
    if (!filteredProducts?.length) {
      toast.error("No products to export");
      return;
    }

    setIsExporting(true);
    try {
      const exportData = filteredProducts.map((product) => ({
        product_id: product.product_number || product.id,
        sku: product.sku || "",
        name: product.name,
        category_names: (product as any).category?.name || "",
        price: Number(product.base_price).toFixed(2),
        currency: "USD",
        stock_quantity: (product as any).product_variants?.reduce(
          (sum: number, v: any) => sum + (v.stock_quantity || 0),
          0
        ) || 0,
        status: product.is_active ? "Active" : "Draft",
        created_at: format(new Date(product.created_at), "yyyy-MM-dd HH:mm"),
        updated_at: format(new Date(product.updated_at), "yyyy-MM-dd HH:mm"),
      }));

      const columns = [
        { key: "product_id" as const, header: "Product ID" },
        { key: "sku" as const, header: "SKU" },
        { key: "name" as const, header: "Name" },
        { key: "category_names" as const, header: "Category" },
        { key: "price" as const, header: "Price" },
        { key: "currency" as const, header: "Currency" },
        { key: "stock_quantity" as const, header: "Stock Quantity" },
        { key: "status" as const, header: "Status" },
        { key: "created_at" as const, header: "Created At" },
        { key: "updated_at" as const, header: "Updated At" },
      ];

      const filename = `pheres-products-${format(new Date(), "yyyy-MM-dd")}.csv`;
      exportToCsv(exportData, columns, filename);
      toast.success(`Exported ${exportData.length} products`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export products");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    
    if (error) {
      toast.error("Failed to delete product");
    } else {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    }
    setDeleteId(null);
  };

  const getPrimaryImage = (product: any) => {
    const primary = product.product_images?.find((img: any) => img.is_primary);
    return primary?.image_url || product.product_images?.[0]?.image_url;
  };

  const getCollectionNames = (product: any) => {
    return product.product_collections
      ?.map((pc: any) => pc.collections?.name)
      .filter(Boolean)
      .join(", ");
  };

  return (
    <AdminLayout title="Products" description="Manage your product catalog">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
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
          <p className="text-muted-foreground">Failed to load products.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredProducts?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? "No products match your search." : "No products yet."}
          </p>
          {!search && (
            <Button asChild className="mt-4">
              <Link to="/admin/products/new">Add your first product</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden lg:table-cell">Collection</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground">
                      {product.product_number || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                      {getPrimaryImage(product) ? (
                        <img
                          src={getPrimaryImage(product)}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${Number(product.base_price).toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {getCollectionNames(product) || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/products/${product.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and all associated images and variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
