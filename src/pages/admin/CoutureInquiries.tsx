import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminCoutureInquiries } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  Search, 
  Mail, 
  MailOpen, 
  Archive, 
  Trash2, 
  Phone, 
  User,
  Calendar,
  MapPin,
  Gem,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  preferred_contact: string;
  message: string | null;
  product_id: string | null;
  product_name: string;
  interested_in_viewing: boolean;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export default function AdminCoutureInquiries() {
  const { data: inquiries, isLoading, error } = useAdminCoutureInquiries();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);

  const filteredInquiries = inquiries?.filter((inq) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      inq.name?.toLowerCase().includes(searchLower) ||
      inq.email?.toLowerCase().includes(searchLower) ||
      inq.product_name?.toLowerCase().includes(searchLower) ||
      inq.country?.toLowerCase().includes(searchLower) ||
      inq.message?.toLowerCase().includes(searchLower);

    if (filter === "unread") return matchesSearch && !inq.is_read && !inq.is_archived;
    if (filter === "archived") return matchesSearch && inq.is_archived;
    return matchesSearch && !inq.is_archived;
  });

  const unreadCount = inquiries?.filter((i) => !i.is_read && !i.is_archived).length || 0;

  const handleViewInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    
    if (!inquiry.is_read) {
      try {
        await supabase
          .from("couture_inquiries")
          .update({ is_read: true })
          .eq("id", inquiry.id);
        
        queryClient.invalidateQueries({ queryKey: ["admin-couture-inquiries"] });
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
  };

  const handleArchive = async (id: string, archived: boolean) => {
    try {
      await supabase
        .from("couture_inquiries")
        .update({ is_archived: archived })
        .eq("id", id);
      
      toast.success(archived ? "Inquiry archived" : "Inquiry restored");
      queryClient.invalidateQueries({ queryKey: ["admin-couture-inquiries"] });
      setSelectedInquiry(null);
    } catch (err) {
      console.error("Error archiving:", err);
      toast.error("Failed to update inquiry");
    }
  };

  const handleDelete = (id: string) => {
    setInquiryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!inquiryToDelete) return;

    try {
      const { error } = await supabase
        .from("couture_inquiries")
        .delete()
        .eq("id", inquiryToDelete);

      if (error) throw error;
      toast.success("Inquiry deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-couture-inquiries"] });
      setSelectedInquiry(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete inquiry");
    } finally {
      setIsDeleteDialogOpen(false);
      setInquiryToDelete(null);
    }
  };

  if (error) {
    return (
      <AdminLayout title="Couture Inquiries">
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading inquiries. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Couture Inquiries">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Couture Inquiries</h1>
          <p className="text-muted-foreground">
            Inquiries about one-of-a-kind pieces
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inquiries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("archived")}
            >
              Archived
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>From</TableHead>
                <TableHead>Piece</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredInquiries?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    {search
                      ? "No inquiries match your search."
                      : filter === "archived"
                      ? "No archived inquiries."
                      : filter === "unread"
                      ? "No unread inquiries."
                      : "No inquiries yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInquiries?.map((inq) => (
                  <TableRow
                    key={inq.id}
                    className={`cursor-pointer ${!inq.is_read ? "bg-muted/30" : ""}`}
                    onClick={() => handleViewInquiry(inq)}
                  >
                    <TableCell>
                      {inq.is_read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className={`${!inq.is_read ? "font-semibold" : ""}`}>
                          {inq.name}
                        </span>
                        <span className="text-muted-foreground text-sm block">
                          {inq.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4 text-primary" />
                        <span className={`${!inq.is_read ? "font-semibold" : ""}`}>
                          {inq.product_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {inq.country}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {inq.preferred_contact}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(inq.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchive(inq.id, !inq.is_archived)}
                          title={inq.is_archived ? "Restore" : "Archive"}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inq.id)}
                          title="Delete"
                        >
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

        {/* Inquiry Detail Dialog */}
        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-primary" />
                {selectedInquiry?.product_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedInquiry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedInquiry.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedInquiry.country}</span>
                  </div>
                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedInquiry.phone}`} className="text-primary hover:underline">
                        {selectedInquiry.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      Prefers: {selectedInquiry.preferred_contact}
                    </Badge>
                  </div>
                </div>

                {selectedInquiry.interested_in_viewing && (
                  <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Interested in viewing this piece in person</span>
                  </div>
                )}

                {selectedInquiry.message && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Message</p>
                    <p className="whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(selectedInquiry.id, !selectedInquiry.is_archived)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {selectedInquiry.is_archived ? "Restore" : "Archive"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedInquiry.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <Button asChild>
                    <a href={`mailto:${selectedInquiry.email}?subject=Re: Your inquiry about ${selectedInquiry.product_name}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reply
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this inquiry? This action cannot be undone.
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
