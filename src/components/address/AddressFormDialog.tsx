import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/ui/country-select";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export interface Address {
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

interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-full">
      <div className="space-y-4 flex-1 overflow-y-auto overscroll-contain -mx-6 px-6 pb-4">
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
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t mt-4 -mx-6 px-6 bg-background sticky bottom-0">
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

interface AddressFormDialogProps {
  address: Address | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddressFormDialog({ address, open, onOpenChange }: AddressFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{address ? "Edit" : "Add"} Address</DialogTitle>
        </DialogHeader>
        {open && (
          <AddressForm
            address={address}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
