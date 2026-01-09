import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sanitizeText } from "@/lib/sanitize";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  useAdminCollectionsByType, 
  useAdminParentCollections,
  useAdminCollections 
} from "@/hooks/useAdmin";
import { useStorageCleanup, getEntityImageUrl } from "@/hooks/useStorageCleanup";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";

type CollectionType = "couture" | "ready_to_wear";

// Parent collection IDs (fixed UUIDs from migration)
const PARENT_IDS = {
  couture: "00000000-0000-0000-0000-000000000001",
  ready_to_wear: "00000000-0000-0000-0000-000000000002",
};

interface CollectionFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  archived: boolean;
}

export default function AdminCollections() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<CollectionType>("ready_to_wear");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [pendingArchiveData, setPendingArchiveData] = useState<CollectionFormData | null>(null);
  const [formData, setFormData] = useState<CollectionFormData>({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_active: true,
    is_featured: false,
    archived: false,
  });

  // Fetch data
  const { data: parentCollections } = useAdminParentCollections();
  const { data: allCollections } = useAdminCollections();
  const { 
    data: coutureCollections, 
    isLoading: coutureLoading, 
    isError: coutureError,
    refetch: refetchCouture 
  } = useAdminCollectionsByType("couture");
  const { 
    data: readyToWearCollections, 
    isLoading: rtwLoading, 
    isError: rtwError,
    refetch: refetchRtw 
  } = useAdminCollectionsByType("ready_to_wear");

  const storageCleanup = useStorageCleanup();

  // Find unassigned collections (no parent_id but not a parent itself)
  const unassignedCollections = allCollections?.filter(
    (c) => c.parent_id === null && !Object.values(PARENT_IDS).includes(c.id)
  ) || [];

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      image_url: "",
      is_active: true,
      is_featured: false,
      archived: false,
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (collection: any) => {
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || "",
      image_url: collection.image_url || "",
      is_active: collection.is_active,
      is_featured: collection.is_featured,
      archived: collection.archived ?? false,
    });
    setEditingId(collection.id);
    setIsDialogOpen(true);
  };

  // Get the existing collection being edited to check archive status change
  const existingCollection = editingId 
    ? [...(coutureCollections || []), ...(readyToWearCollections || [])].find(c => c.id === editingId)
    : null;

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    // Check if we're toggling archive ON for an existing collection
    if (editingId && formData.archived && !existingCollection?.archived) {
      // Show confirmation dialog
      setPendingArchiveData(formData);
      setArchiveConfirmOpen(true);
      return;
    }

    await performSave(formData);
  };

  const performSave = async (data: CollectionFormData) => {
    setIsSaving(true);

    try {
      const parentId = PARENT_IDS[activeTab];
      
      if (editingId) {
        // Update existing collection
        const { error } = await supabase
          .from("collections")
          .update({
            ...data,
            parent_id: parentId, // Ensure parent_id is set
          })
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Collection updated");
      } else {
        // Create new child collection
        const { error } = await supabase.from("collections").insert({
          ...data,
          parent_id: parentId,
          collection_type: activeTab, // Will be synced by trigger anyway
        });
        if (error) throw error;
        toast.success("Collection created");
      }

      // Invalidate all collection and product queries
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-collections-by-type"] });
      queryClient.invalidateQueries({ queryKey: ["admin-child-collections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product"] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save collection");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (pendingArchiveData) {
      await performSave(pendingArchiveData);
    }
    setArchiveConfirmOpen(false);
    setPendingArchiveData(null);
  };

  const handleAssignToParent = async (collectionId: string, parentType: CollectionType) => {
    const parentId = PARENT_IDS[parentType];
    
    const { error } = await supabase
      .from("collections")
      .update({ parent_id: parentId })
      .eq("id", collectionId);

    if (error) {
      toast.error("Failed to assign collection");
    } else {
      toast.success(`Collection assigned to ${parentType === "couture" ? "Couture" : "Ready To Wear"}`);
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-collections-by-type"] });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    // Get the collection to collect image URL before deletion
    const allColls = [...(coutureCollections || []), ...(readyToWearCollections || [])];
    const collectionToDelete = allColls.find((c) => c.id === deleteId);
    const imageUrls = collectionToDelete ? getEntityImageUrl(collectionToDelete) : [];

    const { error } = await supabase.from("collections").delete().eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete collection");
    } else {
      toast.success("Collection deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-collections"] });
      queryClient.invalidateQueries({ queryKey: ["admin-collections-by-type"] });

      // Cleanup orphaned images in background
      if (imageUrls.length > 0) {
        storageCleanup.mutate(imageUrls, {
          onSuccess: (data) => {
            if (data.deletedCount > 0) {
              console.log(`Cleaned up ${data.deletedCount} orphaned image(s)`);
            }
          },
          onError: (err) => {
            console.error("Image cleanup error:", err);
          },
        });
      }
    }
    setDeleteId(null);
  };

  const renderCollectionGrid = (
    collections: any[] | undefined,
    isLoading: boolean,
    isError: boolean,
    refetch: () => void
  ) => {
    if (isLoading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load collections.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      );
    }

    if (!collections || collections.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No collections in this category yet.</p>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Collection
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <Card key={col.id} className={col.archived ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg bg-muted">
                {col.image_url ? (
                  <img
                    src={col.image_url}
                    alt={col.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">No image</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-medium">{col.name}</h3>
                {col.archived && (
                  <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">Archived</Badge>
                )}
                {!col.is_active && (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
                {col.is_featured && (
                  <Badge variant="outline" className="text-xs">Featured</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{col.description ? sanitizeText(col.description) : ""}</p>
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(col)}>
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleteId(col.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout title="Collections" description="Manage your product collections organized by type">
      {/* Unassigned Collections Alert */}
      {unassignedCollections.length > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{unassignedCollections.length} collection(s)</strong> need to be assigned to a category:
            <div className="mt-2 flex flex-wrap gap-2">
              {unassignedCollections.map((col) => (
                <div key={col.id} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                  <span className="font-medium">{col.name}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => handleAssignToParent(col.id, "couture")}
                  >
                    → Couture
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={() => handleAssignToParent(col.id, "ready_to_wear")}
                  >
                    → Ready To Wear
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CollectionType)}>
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="ready_to_wear" className="gap-2">
              Ready To Wear
              {readyToWearCollections && (
                <Badge variant="secondary" className="ml-1">{readyToWearCollections.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="couture" className="gap-2">
              Couture
              {coutureCollections && (
                <Badge variant="secondary" className="ml-1">{coutureCollections.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add {activeTab === "couture" ? "Couture" : "Ready To Wear"} Collection
          </Button>
        </div>

        <TabsContent value="ready_to_wear" className="mt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Products in Ready To Wear collections can be purchased directly on the website.
          </p>
          {renderCollectionGrid(readyToWearCollections, rtwLoading, rtwError, refetchRtw)}
        </TabsContent>

        <TabsContent value="couture" className="mt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Products in Couture collections are one-of-a-kind pieces. Customers must inquire to purchase.
          </p>
          {renderCollectionGrid(coutureCollections, coutureLoading, coutureError, refetchCouture)}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Collection" : `New ${activeTab === "couture" ? "Couture" : "Ready To Wear"} Collection`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setFormData((prev) => ({ ...prev, name, slug: editingId ? prev.slug : slug }));
                }}
                placeholder="e.g., Eternal Radiance"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="e.g., eternal-radiance"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor
                content={formData.description}
                onChange={(description) => setFormData((prev) => ({ ...prev, description }))}
                placeholder="Collection description with rich formatting"
              />
            </div>
            <div className="space-y-2">
              <Label>Hero Image</Label>
              <ImageUploadField
                value={formData.image_url}
                onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                folder="collections"
                aspectRatio="square"
                placeholder="Drag & drop a collection image"
              />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(val) => setFormData((prev) => ({ ...prev, is_active: val }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(val) => setFormData((prev) => ({ ...prev, is_featured: val }))}
                />
                <Label>Featured</Label>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.archived}
                  onCheckedChange={(val) => setFormData((prev) => ({ ...prev, archived: val }))}
                />
                <Label>Archived (no longer sold, kept for archive/proof)</Label>
              </div>
              <p className="text-xs text-muted-foreground pl-8">
                Archived collections remain visible but their products cannot be purchased.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive collection?</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving this collection will also archive all products within it. 
              They will no longer be purchasable on the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingArchiveData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              Archive Collection & Products
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Products in this collection will not be deleted, 
              but they will no longer be associated with this collection.
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
