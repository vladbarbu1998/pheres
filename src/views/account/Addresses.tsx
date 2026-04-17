"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddressForm, AddressFormDialog, type Address } from "@/components/address/AddressFormDialog";
import { useAddresses } from "@/hooks/useAccount";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AddressesPage() {
  const { data: addresses, isLoading, isError, refetch } = useAddresses();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted");
    },
    onError: () => {
      toast.error("Failed to delete address");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, unset all defaults
      const { error: unsetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .neq("id", id);
      if (unsetError) throw unsetError;

      // Then set the new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Default address updated");
    },
    onError: () => {
      toast.error("Failed to update default address");
    },
  });

  return (
    <AccountLayout title="Addresses" description="Manage your shipping addresses" isLoading={isLoading}>
      {isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Something went wrong loading your addresses.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Add button */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Address</DialogTitle>
                <DialogDescription>Add a new shipping address to your account.</DialogDescription>
              </DialogHeader>
              <AddressForm
                onSuccess={() => setIsAddOpen(false)}
                onCancel={() => setIsAddOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Edit Address Dialog */}
          <AddressFormDialog
            address={editingAddress}
            open={!!editingAddress}
            onOpenChange={(open) => !open && setEditingAddress(null)}
          />

          {/* Address list */}
          {addresses?.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">No addresses saved</h3>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                Add your first shipping address to make checkout faster.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses?.map((address) => (
                <Card key={address.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {address.label && (
                            <span className="font-medium">{address.label}</span>
                          )}
                          {address.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm">
                          {address.first_name} {address.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.address_line_1}
                          {address.address_line_2 && <>, {address.address_line_2}</>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {address.city}
                          {address.state && `, ${address.state}`} {address.postal_code}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        {address.phone && (
                          <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAddress(address as Address)}
                      >
                        Edit
                      </Button>

                      {!address.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultMutation.mutate(address.id)}
                          disabled={setDefaultMutation.isPending}
                        >
                          <Star className="mr-1 h-3 w-3" />
                          Set Default
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete address?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this
                              address from your account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(address.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </AccountLayout>
  );
}