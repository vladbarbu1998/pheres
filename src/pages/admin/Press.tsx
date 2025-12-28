import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useAdminPress } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Plus, Pencil, Trash2, Image as ImageIcon, Star, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface PressFormData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  celebrity_name: string;
  event_name: string;
  event_date: string;
  image_url: string;
  external_link: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
}

const defaultFormData: PressFormData = {
  title: "",
  slug: "",
  description: "",
  celebrity_name: "",
  event_name: "",
  event_date: "",
  image_url: "",
  external_link: "",
  is_published: false,
  is_featured: false,
  display_order: 0,
};

export default function AdminPress() {
  const { data: press, isLoading, error } = useAdminPress();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPress, setSelectedPress] = useState<string | null>(null);
  const [formData, setFormData] = useState<PressFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const filteredPress = press?.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.celebrity_name?.toLowerCase().includes(searchLower) ||
      item.event_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = () => {
    setFormData({
      ...defaultFormData,
      display_order: (press?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setFormData({
      id: item.id,
      title: item.title || "",
      slug: item.slug || "",
      description: item.description || "",
      celebrity_name: item.celebrity_name || "",
      event_name: item.event_name || "",
      event_date: item.event_date || "",
      image_url: item.image_url || "",
      external_link: item.external_link || "",
      is_published: item.is_published || false,
      is_featured: item.is_featured || false,
      display_order: item.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedPress(id);
    setIsDeleteDialogOpen(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `press/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("admin-uploads")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("admin-uploads")
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        celebrity_name: formData.celebrity_name || null,
        event_name: formData.event_name || null,
        event_date: formData.event_date || null,
        image_url: formData.image_url || null,
        external_link: formData.external_link || null,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        display_order: formData.display_order,
      };

      if (formData.id) {
        const { error } = await supabase
          .from("press_entries")
          .update(dataToSave)
          .eq("id", formData.id);
        if (error) throw error;
        toast.success("Entry updated");
      } else {
        const { error } = await supabase
          .from("press_entries")
          .insert([dataToSave]);
        if (error) throw error;
        toast.success("Entry created");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-press"] });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPress) return;

    try {
      const { error } = await supabase
        .from("press_entries")
        .delete()
        .eq("id", selectedPress);

      if (error) throw error;
      toast.success("Entry deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-press"] });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedPress(null);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading press entries. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Press & Celebrities</h1>
            <p className="text-muted-foreground">Manage celebrity appearances and press coverage</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, celebrity, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Celebrity</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredPress?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search ? "No entries match your search." : "No press entries yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPress?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.title}</span>
                        {item.is_featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                      </div>
                    </TableCell>
                    <TableCell>{item.celebrity_name || "—"}</TableCell>
                    <TableCell>
                      <div>
                        {item.event_name || "—"}
                        {item.event_date && (
                          <span className="text-muted-foreground text-sm block">
                            {format(new Date(item.event_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? "default" : "secondary"}>
                        {item.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.external_link && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={item.external_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
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
              <DialogTitle>{formData.id ? "Edit Entry" : "New Entry"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: formData.id ? formData.slug : generateSlug(e.target.value),
                      });
                    }}
                    placeholder="Entry title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-friendly-slug"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celebrity_name">Celebrity Name</Label>
                  <Input
                    id="celebrity_name"
                    value={formData.celebrity_name}
                    onChange={(e) => setFormData({ ...formData, celebrity_name: e.target.value })}
                    placeholder="e.g., Michelle Obama"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_name">Event Name</Label>
                  <Input
                    id="event_name"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    placeholder="e.g., Oscars 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external_link">External Link</Label>
                  <Input
                    id="external_link"
                    value={formData.external_link}
                    onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  content={formData.description}
                  onChange={(description) => setFormData({ ...formData, description })}
                  placeholder="Description of the appearance or press coverage"
                />
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex items-center gap-4">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Press"
                      className="h-20 w-32 object-cover rounded"
                    />
                  ) : (
                    <div className="h-20 w-32 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="max-w-xs"
                    />
                    {uploadingImage && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
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
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this press entry? This action cannot be undone.
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
