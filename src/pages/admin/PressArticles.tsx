import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
  useAdminPressArticles,
  useCreatePressArticle,
  useUpdatePressArticle,
  useDeletePressArticle,
  type PressArticleWithOutlet,
} from "@/hooks/usePressArticles";
import { useAdminPressOutlets } from "@/hooks/usePressOutlets";
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
  DialogDescription,
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
import { Search, Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminPressArticles() {
  const { data: articles, isLoading, error } = useAdminPressArticles();
  const { data: outlets } = useAdminPressOutlets();
  const createMutation = useCreatePressArticle();
  const updateMutation = useUpdatePressArticle();
  const deleteMutation = useDeletePressArticle();

  const [search, setSearch] = useState("");
  const [filterOutlet, setFilterOutlet] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Separate state for each form field to prevent re-render issues
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [formTitle, setFormTitle] = useState("");
  const [formOutletId, setFormOutletId] = useState("");
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formPublishDate, setFormPublishDate] = useState("");
  const [formShortDescription, setFormShortDescription] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formIsHighlight, setFormIsHighlight] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);

  const filteredArticles = articles?.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.outlet?.name.toLowerCase().includes(search.toLowerCase());
    const matchesOutlet = filterOutlet === "all" || article.outlet_id === filterOutlet;
    return matchesSearch && matchesOutlet;
  });

  const resetForm = () => {
    setFormId(undefined);
    setFormTitle("");
    setFormOutletId("");
    setFormExternalUrl("");
    setFormPublishDate("");
    setFormShortDescription("");
    setFormThumbnailUrl("");
    setFormIsHighlight(false);
    setFormIsActive(true);
    setFormDisplayOrder(0);
  };

  const handleCreate = () => {
    resetForm();
    setFormDisplayOrder((articles?.length || 0) + 1);
    setIsDialogOpen(true);
  };

  const handleEdit = (article: PressArticleWithOutlet) => {
    setFormId(article.id);
    setFormTitle(article.title);
    setFormOutletId(article.outlet_id);
    setFormExternalUrl(article.external_url);
    setFormPublishDate(article.publish_date || "");
    setFormShortDescription(article.short_description || "");
    setFormThumbnailUrl(article.thumbnail_url || "");
    setFormIsHighlight(article.is_highlight);
    setFormIsActive(article.is_active);
    setFormDisplayOrder(article.display_order);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error("Article title is required");
      return;
    }

    if (!formOutletId) {
      toast.error("Please select an outlet");
      return;
    }

    if (!formExternalUrl.trim()) {
      toast.error("External URL is required");
      return;
    }

    try {
      if (formId) {
        await updateMutation.mutateAsync({
          id: formId,
          title: formTitle,
          outlet_id: formOutletId,
          external_url: formExternalUrl,
          publish_date: formPublishDate || null,
          short_description: formShortDescription || null,
          thumbnail_url: formThumbnailUrl || null,
          is_highlight: formIsHighlight,
          is_active: formIsActive,
          display_order: formDisplayOrder,
        });
        toast.success("Press article updated");
      } else {
        await createMutation.mutateAsync({
          title: formTitle,
          outlet_id: formOutletId,
          external_url: formExternalUrl,
          publish_date: formPublishDate || null,
          short_description: formShortDescription || null,
          thumbnail_url: formThumbnailUrl || null,
          is_highlight: formIsHighlight,
          is_active: formIsActive,
          display_order: formDisplayOrder,
        });
        toast.success("Press article created");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save press article");
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;

    try {
      await deleteMutation.mutateAsync(selectedId);
      toast.success("Press article deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete press article");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  if (error) {
    return (
      <AdminLayout title="Press Articles" backLink="/admin">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading press articles. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Press Articles" description="Manage articles from media outlets">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterOutlet} onValueChange={setFilterOutlet}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by outlet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outlets</SelectItem>
                {outlets?.map((outlet) => (
                  <SelectItem key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Date</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredArticles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search || filterOutlet !== "all"
                      ? "No articles match your filters."
                      : "No press articles yet. Add your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles?.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                        {article.thumbnail_url ? (
                          <img
                            src={article.thumbnail_url}
                            alt={article.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium line-clamp-1">{article.title}</span>
                        {article.is_highlight && <Star className="h-4 w-4 text-primary fill-primary" />}
                      </div>
                      <a
                        href={article.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View article
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {article.outlet?.logo_url && (
                          <img
                            src={article.outlet.logo_url}
                            alt={article.outlet.name}
                            className="h-5 w-5 object-contain"
                          />
                        )}
                        <span className="text-sm">{article.outlet?.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {article.publish_date
                        ? format(new Date(article.publish_date), "MMM d, yyyy")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.is_active ? "default" : "secondary"}>
                        {article.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formId ? "Edit Article" : "New Press Article"}</DialogTitle>
              <DialogDescription>
                {formId ? "Update the article details below." : "Add a new press article with external link."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title *</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Pheres Jewelry Shines at Met Gala"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outlet_id">Outlet *</Label>
                <Select
                  value={formOutletId}
                  onValueChange={setFormOutletId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outlets?.map((outlet) => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_url">Article URL *</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formExternalUrl}
                  onChange={(e) => setFormExternalUrl(e.target.value)}
                  placeholder="https://www.vogue.com/article/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publish_date">Publish Date</Label>
                <Input
                  id="publish_date"
                  type="date"
                  value={formPublishDate}
                  onChange={(e) => setFormPublishDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formShortDescription}
                  onChange={(e) => setFormShortDescription(e.target.value)}
                  placeholder="Brief summary of the article..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUploadField
                  value={formThumbnailUrl}
                  onChange={setFormThumbnailUrl}
                  folder="press-articles"
                  aspectRatio="landscape"
                  placeholder="Upload article thumbnail"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_highlight">Highlight (Featured)</Label>
                <Switch
                  id="is_highlight"
                  checked={formIsHighlight}
                  onCheckedChange={setFormIsHighlight}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
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
              <AlertDialogTitle>Delete Press Article?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this press article. This action cannot be undone.
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
