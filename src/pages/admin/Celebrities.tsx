import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Plus, Pencil, Trash2, Image as ImageIcon, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const SECTIONS = ["Red Carpet", "Magazine Cover", "Special Appearance"] as const;
type Section = typeof SECTIONS[number];

interface CelebrityFormData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  celebrity_name: string;
  event_name: string;
  event_date: string;
  location: string;
  section: string;
  image_url: string;
  jewelry_photo_url: string;
  notes: string;
  external_link: string;
  is_published: boolean;
  is_featured: boolean;
  display_order: number;
}

const defaultFormData: CelebrityFormData = {
  title: "",
  slug: "",
  description: "",
  celebrity_name: "",
  event_name: "",
  event_date: "",
  location: "",
  section: "",
  image_url: "",
  jewelry_photo_url: "",
  notes: "",
  external_link: "",
  is_published: true,
  is_featured: false,
  display_order: 0,
};

function useAdminCelebrities() {
  return useQuery({
    queryKey: ["admin-celebrities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_entries")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export default function AdminCelebrities() {
  const { data: celebrities, isLoading, error } = useAdminCelebrities();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CelebrityFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const filteredCelebrities = celebrities?.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.celebrity_name?.toLowerCase().includes(searchLower) ||
      item.event_name?.toLowerCase().includes(searchLower) ||
      item.section?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreate = () => {
    setFormData({
      ...defaultFormData,
      display_order: (celebrities?.length || 0) + 1,
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
      location: item.location || "",
      section: item.section || "",
      image_url: item.image_url || "",
      jewelry_photo_url: item.jewelry_photo_url || "",
      notes: item.notes || "",
      external_link: item.external_link || "",
      is_published: item.is_published || false,
      is_featured: item.is_featured || false,
      display_order: item.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSave = async () => {
    if (!formData.celebrity_name) {
      toast.error("Celebrity name is required");
      return;
    }

    if (!formData.image_url) {
      toast.error("Celebrity photo is required");
      return;
    }

    setSaving(true);
    try {
      // Auto-generate title and slug if empty
      const eventName = formData.event_name?.trim();
      const title = formData.title?.trim() || (
        eventName 
          ? `${formData.celebrity_name} at ${eventName}` 
          : formData.celebrity_name
      );
      const slug = formData.slug?.trim() || generateSlug(title);

      const dataToSave = {
        title,
        slug,
        description: formData.description || null,
        celebrity_name: formData.celebrity_name,
        event_name: eventName || null,
        event_date: formData.event_date || null,
        location: formData.location || null,
        section: formData.section || null,
        image_url: formData.image_url,
        jewelry_photo_url: formData.jewelry_photo_url || null,
        notes: formData.notes || null,
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
        toast.success("Celebrity appearance updated");
      } else {
        const { error } = await supabase
          .from("press_entries")
          .insert([dataToSave]);
        if (error) throw error;
        toast.success("Celebrity appearance created");
      }

      queryClient.invalidateQueries({ queryKey: ["admin-celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["press"] });
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save celebrity appearance");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      const { error } = await supabase
        .from("press_entries")
        .delete()
        .eq("id", selectedId);

      if (error) throw error;
      toast.success("Celebrity appearance deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-celebrities"] });
      queryClient.invalidateQueries({ queryKey: ["press"] });
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete celebrity appearance");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading celebrity appearances. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Celebrity Appearances</h1>
            <p className="text-muted-foreground">Manage celebrities wearing Pheres jewelry</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Appearance
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by celebrity, event, or section..."
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
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Celebrity</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Section</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredCelebrities?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search ? "No appearances match your search." : "No celebrity appearances yet. Add your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCelebrities?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.celebrity_name || item.title}
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
                        <span className="font-medium">{item.celebrity_name || "—"}</span>
                        {item.is_featured && <Star className="h-4 w-4 text-primary fill-primary" />}
                      </div>
                    </TableCell>
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
                      {item.section ? (
                        <Badge variant="outline">{item.section}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? "default" : "secondary"}>
                        {item.is_published ? "Published" : "Draft"}
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Appearance" : "New Celebrity Appearance"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Celebrity & Event Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celebrity_name">Celebrity Name *</Label>
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
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Los Angeles, CA"
                  />
                </div>
              </div>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Celebrity Photo *</Label>
                  <ImageUploadField
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    folder="celebrities"
                    aspectRatio="portrait"
                    placeholder="Drag & drop celebrity photo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jewelry Photo</Label>
                  <ImageUploadField
                    value={formData.jewelry_photo_url}
                    onChange={(url) => setFormData({ ...formData, jewelry_photo_url: url })}
                    folder="celebrities"
                    aspectRatio="square"
                    placeholder="Drag & drop jewelry photo"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  content={formData.description}
                  onChange={(description) => setFormData({ ...formData, description })}
                  placeholder="Description of the appearance (shown publicly)"
                />
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes (not shown publicly)"
                  rows={3}
                />
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
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
                    placeholder="Auto-generated if empty"
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

              {/* Settings */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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
              <AlertDialogTitle>Delete Appearance</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this celebrity appearance? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
