import { useState } from "react";
import { MapPin, Plus, Trash2, Star, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AccountLayout } from "@/components/account/AccountLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneInput } from "@/components/ui/phone-input";
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
import { useAddresses } from "@/hooks/useAccount";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const addressSchema = z.object({
  label: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  address_line_1: z.string().min(1, "Address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  phone: z.string().optional(),
  is_default: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
  id: string;
  label?: string | null;
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  phone?: string | null;
  is_default: boolean;
}

function AddressForm({
  address,
  onSuccess,
  onCancel,
}: {
  address?: Address | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          label: address.label || "",
          first_name: address.first_name,
          last_name: address.last_name,
          address_line_1: address.address_line_1,
          address_line_2: address.address_line_2 || "",
          city: address.city,
          state: address.state || "",
          postal_code: address.postal_code,
          country: address.country,
          phone: address.phone || "",
          is_default: address.is_default,
        }
      : {
          country: "United States",
          is_default: false,
        },
  });

  const onSubmit = async (data: AddressFormData) => {
    if (!user) return;
    setIsLoading(true);

    try {
      if (address) {
        const { error } = await supabase
          .from("addresses")
          .update({
            ...data,
            address_line_2: data.address_line_2 || null,
            state: data.state || null,
            phone: data.phone || null,
            label: data.label || null,
          })
          .eq("id", address.id);

        if (error) throw error;
        toast.success("Address updated");
      } else {
        const insertData = {
          user_id: user.id,
          first_name: data.first_name,
          last_name: data.last_name,
          address_line_1: data.address_line_1,
          address_line_2: data.address_line_2 || null,
          city: data.city,
          state: data.state || null,
          postal_code: data.postal_code,
          country: data.country,
          phone: data.phone || null,
          label: data.label || null,
          is_default: data.is_default || false,
        };

        const { error } = await supabase.from("addresses").insert(insertData);

        if (error) throw error;
        toast.success("Address added");
      }

      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      onSuccess();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="label">Label (optional)</Label>
        <Input id="label" placeholder="e.g., Home, Office" {...register("label")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register("first_name")}
            className={errors.first_name ? "border-destructive" : ""}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register("last_name")}
            className={errors.last_name ? "border-destructive" : ""}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_line_1">Address</Label>
        <Input
          id="address_line_1"
          {...register("address_line_1")}
          className={errors.address_line_1 ? "border-destructive" : ""}
        />
        {errors.address_line_1 && (
          <p className="text-sm text-destructive">{errors.address_line_1.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address_line_2">Apartment, suite, etc. (optional)</Label>
        <Input id="address_line_2" {...register("address_line_2")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register("city")}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State / Province (optional)</Label>
          <Input id="state" {...register("state")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            {...register("postal_code")}
            className={errors.postal_code ? "border-destructive" : ""}
          />
          {errors.postal_code && (
            <p className="text-sm text-destructive">{errors.postal_code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <CountrySelect
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.country}
              />
            )}
          />
          {errors.country && (
            <p className="text-sm text-destructive">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Phone (optional)</Label>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              value={field.value || ""}
              onValueChange={field.onChange}
              placeholder="Phone number"
            />
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {address ? "Update" : "Add"} Address
        </Button>
      </div>
    </form>
  );
}

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
    <AccountLayout title="Addresses" description="Manage your shipping addresses">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Something went wrong loading your addresses.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
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
                      <Dialog
                        open={editingAddress?.id === address.id}
                        onOpenChange={(open) => !open && setEditingAddress(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingAddress(address)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Address</DialogTitle>
                          </DialogHeader>
                          <AddressForm
                            address={editingAddress}
                            onSuccess={() => setEditingAddress(null)}
                            onCancel={() => setEditingAddress(null)}
                          />
                        </DialogContent>
                      </Dialog>

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
        </div>
      )}
    </AccountLayout>
  );
}
