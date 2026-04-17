"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { supabase } from "@/integrations/supabase/client";
import {
  useAdminPressOutlets,
  useCreatePressOutlet,
  useUpdatePressOutlet,
  useDeletePressOutlet,
  type PressOutlet,
} from "@/hooks/usePressOutlets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OutletFormData {
  id?: string;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
  display_order: number;
}

const defaultFormData: OutletFormData = {
  name: "",
  slug: "",
  logo_url: "",
  website_url: "",
  is_active: true,
  display_order: 0,
};

export default function AdminPressOutlets() {
  const { data: outlets, isLoading, error } = useAdminPressOutlets();
  const createMutation = useCreatePressOutlet();
  const updateMutation = useUpdatePressOutlet();
  const deleteMutation = useDeletePressOutlet();

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<OutletFormData>(defaultFormData);

  const filteredOutlets = outlets?.filter((outlet) =>
    outlet.name.toLowerCase().includes(search.toLowerCase())
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreate = () => {
    setFormData({
      ...defaultFormData,
      display_order: (outlets?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (outlet: PressOutlet) => {
    setFormData({
      id: outlet.id,
      name: outlet.name,
      slug: outlet.slug,
      logo_url: outlet.logo_url,
      website_url: outlet.website_url || "",
      is_active: outlet.is_active,
      display_order: outlet.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Outlet name is required");
      return;
    }

    if (!formData.logo_url) {
      toast.error("Logo is required");
      return;
    }

    let slug = formData.slug || generateSlug(formData.name);

    try {
      // For new outlets, check if slug exists and make it unique
      if (!formData.id) {
        const { data: existingSlugs } = await supabase
          .from("press_outlets")
          .select("slug")
          .ilike("slug", `${slug}%`);

        if (existingSlugs && existingSlugs.length > 0) {
          const slugSet = new Set(existingSlugs.map((s) => s.slug));
          if (slugSet.has(slug)) {
            let counter = 2;
            while (slugSet.has(`${slug}-${counter}`)) {
              counter++;
            }
            slug = `${slug}-${counter}`;
          }
        }
      }

      if (formData.id) {
        await updateMutation.mutateAsync({
          id: formData.id,
          name: formData.name,
          slug,
          logo_url: formData.logo_url,
          website_url: formData.website_url || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
        });
        toast.success("Press outlet updated");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          slug,
          logo_url: formData.logo_url,
          website_url: formData.website_url || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
        });
        toast.success("Press outlet created");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error("Save error:", err);
      if (err?.code === "23505") {
        toast.error("An outlet with this name already exists");
      } else {
        toast.error("Failed to save press outlet");
      }
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteMutation.mutateAsync(selectedId);
      toast.success("Press outlet deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete press outlet. It may have associated articles.");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  if (error) {
    return (
      <AdminLayout title="Press Outlets" backLink="/admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading press outlets. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Press Outlets" description="Manage media outlets (Vogue, Forbes, etc.)">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search outlets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Outlet
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOutlets?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    {search ? "No outlets match your search." : "No press outlets yet. Add your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOutlets?.map((outlet) => (
                  <TableRow key={outlet.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {outlet.logo_url ? (
                          <img
                            src={outlet.logo_url}
                            alt={outlet.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{outlet.name}</TableCell>
                    <TableCell>
                      {outlet.website_url ? (
                        <a
                          href={outlet.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={outlet.is_active ? "default" : "secondary"}>
                        {outlet.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(outlet)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(outlet.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Outlet" : "New Press Outlet"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Outlet Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  placeholder="e.g., Vogue, Forbes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated from name"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo *</Label>
                <ImageUploadField
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  folder="press-outlets"
                  aspectRatio="square"
                  placeholder="Upload outlet logo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://www.vogue.com"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Press Outlet?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this press outlet and all associated articles. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}