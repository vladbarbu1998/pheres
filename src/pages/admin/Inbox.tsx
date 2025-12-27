import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminMessages } from "@/hooks/useAdmin";
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
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export default function AdminInbox() {
  const { data: messages, isLoading, error } = useAdminMessages();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const filteredMessages = messages?.filter((msg) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      msg.name?.toLowerCase().includes(searchLower) ||
      msg.email?.toLowerCase().includes(searchLower) ||
      msg.subject?.toLowerCase().includes(searchLower) ||
      msg.message?.toLowerCase().includes(searchLower);

    if (filter === "unread") return matchesSearch && !msg.is_read && !msg.is_archived;
    if (filter === "archived") return matchesSearch && msg.is_archived;
    return matchesSearch && !msg.is_archived;
  });

  const unreadCount = messages?.filter((m) => !m.is_read && !m.is_archived).length || 0;

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    
    if (!message.is_read) {
      try {
        await supabase
          .from("contact_messages")
          .update({ is_read: true })
          .eq("id", message.id);
        
        queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        queryClient.invalidateQueries({ queryKey: ["admin-recent-messages"] });
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
  };

  const handleArchive = async (id: string, archived: boolean) => {
    try {
      await supabase
        .from("contact_messages")
        .update({ is_archived: archived })
        .eq("id", id);
      
      toast.success(archived ? "Message archived" : "Message restored");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelectedMessage(null);
    } catch (err) {
      console.error("Error archiving:", err);
      toast.error("Failed to update message");
    }
  };

  const handleDelete = (id: string) => {
    setMessageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", messageToDelete);

      if (error) throw error;
      toast.success("Message deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setSelectedMessage(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete message");
    } finally {
      setIsDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading messages. Please try again.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-muted-foreground">
            Contact form submissions
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
              placeholder="Search messages..."
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
                <TableHead>Subject</TableHead>
                <TableHead>Message</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredMessages?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search
                      ? "No messages match your search."
                      : filter === "archived"
                      ? "No archived messages."
                      : filter === "unread"
                      ? "No unread messages."
                      : "No messages yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages?.map((msg) => (
                  <TableRow
                    key={msg.id}
                    className={`cursor-pointer ${!msg.is_read ? "bg-muted/30" : ""}`}
                    onClick={() => handleViewMessage(msg)}
                  >
                    <TableCell>
                      {msg.is_read ? (
                        <MailOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Mail className="h-4 w-4 text-primary" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className={`${!msg.is_read ? "font-semibold" : ""}`}>
                          {msg.name}
                        </span>
                        <span className="text-muted-foreground text-sm block">
                          {msg.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${!msg.is_read ? "font-semibold" : ""}`}>
                      {msg.subject || "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {msg.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(msg.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchive(msg.id, !msg.is_archived)}
                          title={msg.is_archived ? "Restore" : "Archive"}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(msg.id)}
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

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.subject || "Message"}</DialogTitle>
            </DialogHeader>
            
            {selectedMessage && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedMessage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedMessage.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${selectedMessage.phone}`} className="text-primary hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(selectedMessage.id, !selectedMessage.is_archived)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {selectedMessage.is_archived ? "Restore" : "Archive"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <Button asChild>
                    <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your inquiry"}`}>
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
              <AlertDialogTitle>Delete Message</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this message? This action cannot be undone.
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
