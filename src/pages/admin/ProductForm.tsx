import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminProduct, useAdminCategories, useAdminCollections } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().optional(),
  base_price: z.coerce.number().min(0, "Price must be positive"),
  compare_at_price: z.coerce.number().optional().nullable(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  metal_type: z.string().optional(),
  metal_weight: z.string().optional(),
  stone_type: z.string().optional(),
  stone_carat: z.string().optional(),
  stone_clarity: z.string().optional(),
  stone_color: z.string().optional(),
  stone_cut: z.string().optional(),
  certification: z.string().optional(),
  category_id: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  is_bestseller: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductImage {
  id?: string;
  image_url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
  file?: File;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id; // No id param means new product

  const { data: product, isLoading: productLoading } = useAdminProduct(isNew ? undefined : id);
  const { data: categories } = useAdminCategories();
  const { data: collections } = useAdminCollections();

  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      is_new: false,
      is_bestseller: false,
    },
  });

  const nameValue = watch("name");

  // Auto-generate slug from name
  useEffect(() => {
    if (isNew && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, isNew, setValue]);

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        slug: product.slug,
        sku: (product as any).sku || "",
        base_price: product.base_price,
        compare_at_price: product.compare_at_price,
        short_description: product.short_description || "",
        description: product.description || "",
        metal_type: product.metal_type || "",
        metal_weight: product.metal_weight || "",
        stone_type: product.stone_type || "",
        stone_carat: product.stone_carat || "",
        stone_clarity: product.stone_clarity || "",
        stone_color: product.stone_color || "",
        stone_cut: product.stone_cut || "",
        certification: product.certification || "",
        category_id: product.category_id,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_bestseller: product.is_bestseller,
      });
      setImages(
        product.product_images?.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          display_order: img.display_order,
        })) || []
      );
      setSelectedCollections(
        product.product_collections?.map((pc: any) => pc.collection_id) || []
      );
    }
  }, [product, reset]);

  const uploadImages = async (files: FileList | File[]) => {
    setIsUploadingImages(true);
    
    for (const file of Array.from(files)) {
      // Validate file
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("admin-uploads")
        .upload(`products/${fileName}`, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("admin-uploads")
        .getPublicUrl(data.path);

      setImages((prev) => [
        ...prev,
        {
          image_url: urlData.publicUrl,
          is_primary: prev.length === 0,
          display_order: prev.length,
        },
      ]);
    }
    
    setIsUploadingImages(false);
    toast.success("Images uploaded");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadImages(files);
  };

  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  }, []);

  const handleImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  }, []);

  const handleImageDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadImages(files);
    }
  }, []);

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the primary, make the first one primary
      if (prev[index].is_primary && updated.length > 0) {
        updated[0].is_primary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);

    try {
      let productId = id;

      const productData = {
        name: data.name,
        slug: data.slug,
        sku: data.sku || null,
        base_price: data.base_price,
        short_description: data.short_description || null,
        description: data.description || null,
        metal_type: data.metal_type || null,
        metal_weight: data.metal_weight || null,
        stone_type: data.stone_type || null,
        stone_carat: data.stone_carat || null,
        stone_clarity: data.stone_clarity || null,
        stone_color: data.stone_color || null,
        stone_cut: data.stone_cut || null,
        certification: data.certification || null,
        compare_at_price: data.compare_at_price || null,
        category_id: data.category_id || null,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        is_new: data.is_new ?? false,
        is_bestseller: data.is_bestseller ?? false,
      };

      if (isNew) {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([productData])
          .select("id")
          .single();

        if (error) throw error;
        productId = newProduct.id;
      } else {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);

        if (error) throw error;

        // Delete existing images and collections to replace them
        await supabase.from("product_images").delete().eq("product_id", id);
        await supabase.from("product_collections").delete().eq("product_id", id);
      }

      // Insert images
      if (images.length > 0) {
        const { error: imgError } = await supabase.from("product_images").insert(
          images.map((img, i) => ({
            product_id: productId,
            image_url: img.image_url,
            alt_text: img.alt_text || null,
            is_primary: img.is_primary,
            display_order: i,
          }))
        );
        if (imgError) throw imgError;
      }

      // Insert collection relations
      if (selectedCollections.length > 0) {
        const { error: colError } = await supabase.from("product_collections").insert(
          selectedCollections.map((collectionId) => ({
            product_id: productId,
            collection_id: collectionId,
          }))
        );
        if (colError) throw colError;
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      toast.success(isNew ? "Product created" : "Product updated");
      navigate("/admin/products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isNew && productLoading) {
    return (
      <AdminLayout title="Edit Product" backLink="/admin/products">
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isNew ? "New Product" : "Edit Product"}
      backLink="/admin/products"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register("sku")}
                  placeholder="e.g., PH-RNG-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_price">Price *</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  {...register("base_price")}
                  className={errors.base_price ? "border-destructive" : ""}
                />
                {errors.base_price && (
                  <p className="text-sm text-destructive">{errors.base_price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="compare_at_price">Compare at Price</Label>
                <Input
                  id="compare_at_price"
                  type="number"
                  step="0.01"
                  {...register("compare_at_price")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Input id="short_description" {...register("short_description")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              {images.map((img, i) => (
                <div key={i} className="relative group aspect-square">
                  <img
                    src={img.image_url}
                    alt={img.alt_text || "Product image"}
                    className="h-full w-full object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={img.is_primary ? "default" : "secondary"}
                      onClick={() => setPrimaryImage(i)}
                    >
                      {img.is_primary ? "Primary" : "Set Primary"}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeImage(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              <label
                onDragOver={handleImageDragOver}
                onDragLeave={handleImageDragLeave}
                onDrop={handleImageDrop}
                className={cn(
                  "aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors",
                  isDraggingImage
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50",
                  isUploadingImages && "cursor-not-allowed opacity-50"
                )}
              >
                {isUploadingImages ? (
                  <>
                    <Loader2 className="h-6 w-6 text-muted-foreground mb-2 animate-spin" />
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center px-2">
                      Drag & drop or click to upload
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImages}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="metal_type">Metal Type</Label>
                <Input id="metal_type" placeholder="e.g., 18K Rose Gold" {...register("metal_type")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metal_weight">Metal Weight</Label>
                <Input id="metal_weight" placeholder="e.g., 4.5g" {...register("metal_weight")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stone_type">Stone Type</Label>
                <Input id="stone_type" placeholder="e.g., Diamond" {...register("stone_type")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stone_carat">Stone Carat</Label>
                <Input id="stone_carat" placeholder="e.g., 1.5ct" {...register("stone_carat")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stone_clarity">Stone Clarity</Label>
                <Input id="stone_clarity" placeholder="e.g., VVS1" {...register("stone_clarity")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stone_color">Stone Color</Label>
                <Input id="stone_color" placeholder="e.g., D" {...register("stone_color")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stone_cut">Stone Cut</Label>
                <Input id="stone_cut" placeholder="e.g., Excellent" {...register("stone_cut")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certification">Certification</Label>
                <Input id="certification" placeholder="e.g., GIA" {...register("certification")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field }) => (
                    <Select 
                      value={field.value || "none"} 
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No category</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Collections</Label>
                <div className="flex flex-wrap gap-2">
                  {collections?.map((col) => (
                    <Button
                      key={col.id}
                      type="button"
                      size="sm"
                      variant={selectedCollections.includes(col.id) ? "default" : "outline"}
                      onClick={() =>
                        setSelectedCollections((prev) =>
                          prev.includes(col.id)
                            ? prev.filter((id) => id !== col.id)
                            : [...prev, col.id]
                        )
                      }
                    >
                      {col.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <Label>Active</Label>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <Label>Featured</Label>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="is_new"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <Label>New</Label>
                  </div>
                )}
              />
              <Controller
                control={control}
                name="is_bestseller"
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <Label>Bestseller</Label>
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
