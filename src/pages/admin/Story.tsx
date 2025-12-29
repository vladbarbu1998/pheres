import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { useAdminStory } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
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
import { Plus, Pencil, Trash2, Image as ImageIcon, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface StoryFormData {
  id?: string;
  title: string;
  content: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

const defaultFormData: StoryFormData = {
  title: "",
  content: "",
  image_url: "",
  is_active: true,
  display_order: 0,
};

export default function AdminStory() {
  const { data: sections, isLoading, error } = useAdminStory();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<StoryFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  

  const handleCreate = () => {
    setFormData({
      ...defaultFormData,
      display_order: (sections?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title || "",
      content: item.content || "",
      image_url: item.image_url || "",
      is_active: item.is_active ?? true,
      display_order: item.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedSection(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        title: formData.title,
        content: formData.content || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (formData.id) {
        const { error } = await supabase
          .from("story_sections")
          .update(dataToSave)
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Section updated");
      } else {
        const { error } = await supabase
          .from("story_sections")
          .insert([dataToSave]);
        if (error) throw error;
        toast.success("Section created");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-story"] });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedSection) return;

    try {
      const { error } = await supabase
        .from("story_sections")
        .delete()
        .eq("id", selectedSection);

      if (error) throw error;
      toast.success("Section deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-story"] });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete section");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSection(null);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading story sections. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Story Sections</h1>
            <p className="text-muted-foreground">Manage content blocks for the Our Story page</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Section
          </Button>
        </div>

        {/* Info */}
        <div className="bg-muted/50 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Story sections are displayed in order on the Our Story page. Use the display order to control 
            the sequence. Each section can have a title, content, and optional image.
          </p>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sections?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No story sections yet. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                sections?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span>{item.display_order}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {item.content || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Section" : "New Section"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Section content"
                />
              </div>

              <div className="space-y-2">
                <Label>Image (optional)</Label>
                <ImageUploadField
                  value={formData.image_url}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image_url: url }))}
                  folder="story"
                  aspectRatio="landscape"
                  placeholder="Drag & drop a section image"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active (visible on the page)</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Section</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this story section? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
