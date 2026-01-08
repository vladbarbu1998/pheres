import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminProduct, useAdminCategories, useAdminCollectionsByType } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Trash2, Image as ImageIcon, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StoneTypeCombobox } from "@/components/admin/StoneTypeCombobox";

interface ProductMetal {
  id?: string;
  metal_type: string;
  metal_weight: string;
  display_order: number;
}

interface ProductStone {
  id?: string;
  stone_type: string;
  stone_carat: string;
  stone_color: string;
  stone_clarity: string;
  stone_cut: string;
  display_order: number;
}

// Base schema for shared fields
const baseProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  metal_type: z.string().optional(),
  metal_weight: z.string().optional(),
  gross_weight: z.string().optional(),
  size: z.string().optional(),
  certification: z.string().optional(),
  category_id: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  is_bestseller: z.boolean(),
});

// Ready To Wear schema - requires price
const readyToWearSchema = baseProductSchema.extend({
  sku: z.string().optional(),
  base_price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  compare_at_price: z.coerce.number().optional().nullable(),
});

// Couture schema - no price required, has optional model_number
const coutureSchema = baseProductSchema.extend({
  base_price: z.coerce.number().optional().default(0),
  model_number: z.string().optional(),
});

type ProductFormData = z.infer<typeof readyToWearSchema> & { model_number?: string };

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;

  // Determine product type from URL or existing product
  const urlProductType = searchParams.get("type") as "couture" | "ready_to_wear" | null;
  
  const { data: product, isLoading: productLoading } = useAdminProduct(isNew ? undefined : id);
  const { data: categories } = useAdminCategories();
  const { data: coutureCollections } = useAdminCollectionsByType("couture");
  const { data: readyToWearCollections } = useAdminCollectionsByType("ready_to_wear");
  
  // Determine product type: from existing product, URL param, or default to ready_to_wear
  const productType: "couture" | "ready_to_wear" = 
    (product as any)?.product_type || urlProductType || "ready_to_wear";
  
  const isCouture = productType === "couture";

  // Select the appropriate collections based on product type
  const availableCollections = isCouture ? coutureCollections : readyToWearCollections;

  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [metals, setMetals] = useState<ProductMetal[]>([]);
  const [stones, setStones] = useState<ProductStone[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Use the appropriate schema based on product type
  const schema = isCouture ? coutureSchema : readyToWearSchema;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_active: true,
      is_featured: false,
      is_new: false,
      is_bestseller: false,
      short_description: "",
      base_price: isCouture ? 0 : undefined,
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
        gross_weight: (product as any).gross_weight || "",
        size: (product as any).size || "",
        certification: product.certification || "",
        category_id: product.category_id,
        is_active: product.is_active,
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_bestseller: product.is_bestseller,
        model_number: (product as any).model_number || "",
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
      // Load metals from product_metals
      const productMetals = (product as any).product_metals;
      if (productMetals && productMetals.length > 0) {
        setMetals(
          productMetals.map((m: any, i: number) => ({
            id: m.id,
            metal_type: m.metal_type || "",
            metal_weight: m.metal_weight || "",
            display_order: m.display_order ?? i,
          }))
        );
      } else {
        setMetals([]);
      }
      // Load stones from product_stones
      const productStones = (product as any).product_stones;
      if (productStones && productStones.length > 0) {
        setStones(
          productStones.map((s: any, i: number) => ({
            id: s.id,
            stone_type: s.stone_type || "",
            stone_carat: s.stone_carat || "",
            stone_color: s.stone_color || "",
            stone_clarity: s.stone_clarity || "",
            stone_cut: s.stone_cut || "",
            display_order: s.display_order ?? i,
          }))
        );
      } else {
        setStones([]);
      }
    }
  }, [product, reset]);

  const uploadImages = async (files: FileList | File[]) => {
    setIsUploadingImages(true);
    
    for (const file of Array.from(files)) {
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
    // Validate at least one image
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSaving(true);

    try {
      let productId = id;

      const productData = {
        name: data.name,
        slug: data.slug,
        sku: isCouture ? null : (data.sku || null),
        base_price: isCouture ? 0 : data.base_price,
        short_description: data.short_description || null,
        description: data.description || null,
        metal_type: data.metal_type || null,
        metal_weight: data.metal_weight || null,
        gross_weight: data.gross_weight || null,
        size: data.size || null,
        certification: data.certification || null,
        compare_at_price: isCouture ? null : (data.compare_at_price || null),
        category_id: data.category_id || null,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        is_new: data.is_new ?? false,
        is_bestseller: data.is_bestseller ?? false,
        product_type: productType,
        model_number: isCouture ? (data.model_number || null) : null,
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

        await supabase.from("product_images").delete().eq("product_id", id);
        await supabase.from("product_collections").delete().eq("product_id", id);
        await (supabase.from as any)("product_metals").delete().eq("product_id", id);
        await supabase.from("product_stones").delete().eq("product_id", id);
      }

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

      if (selectedCollections.length > 0) {
        const { error: colError } = await supabase.from("product_collections").insert(
          selectedCollections.map((collectionId) => ({
            product_id: productId,
            collection_id: collectionId,
          }))
        );
        if (colError) throw colError;
      }

      // Save metals
      const validMetals = metals.filter((m) => m.metal_type.trim() !== "");
      if (validMetals.length > 0) {
        const { error: metalError } = await (supabase.from as any)("product_metals").insert(
          validMetals.map((metal, i) => ({
            product_id: productId,
            metal_type: metal.metal_type,
            metal_weight: metal.metal_weight || null,
            display_order: i,
          }))
        );
        if (metalError) throw metalError;
      }

      // Save stones
      const validStones = stones.filter((s) => s.stone_type.trim() !== "");
      if (validStones.length > 0) {
        const { error: stoneError } = await supabase.from("product_stones").insert(
          validStones.map((stone, i) => ({
            product_id: productId,
            stone_type: stone.stone_type,
            stone_carat: stone.stone_carat || null,
            stone_color: stone.stone_color || null,
            stone_clarity: stone.stone_clarity || null,
            stone_cut: stone.stone_cut || null,
            display_order: i,
          }))
        );
        if (stoneError) throw stoneError;
      }

      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      queryClient.invalidateQueries({ queryKey: ["all-stone-types"] });
      queryClient.invalidateQueries({ queryKey: ["product-filter-options"] });
      toast.success(isNew ? "Product created" : "Product updated");
      navigate(`/admin/products?type=${productType}`);
    } catch (error: any) {
      console.error(error);
      if (error?.code === "23505" && error?.message?.includes("products_slug_key")) {
        toast.error("A product with this slug already exists. Please use a different slug.");
      } else {
        toast.error("Failed to save product");
      }
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

  const primaryImage = images.find((img) => img.is_primary);
  const galleryImages = images.filter((img) => !img.is_primary);

  return (
    <AdminLayout
      title={isNew ? (isCouture ? "New Couture Piece" : "New Product") : (isCouture ? "Edit Couture Piece" : "Edit Product")}
      backLink={`/admin/products?type=${productType}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Row: Product Type Badge + Actions */}
        <div className="flex items-center justify-between gap-4">
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
            isCouture 
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" 
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
          )}>
            {isCouture ? "Couture (Inquiry Only)" : "Ready To Wear (Purchasable)"}
          </span>
          {/* Actions - always visible */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isNew ? "Create Product" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Two-column layout on large screens */}
        <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
          {/* Left Column: Info + Content */}
          <div className="space-y-6">
            {/* Section 1: Basic Info */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Row 1: Name, Slug, Category */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="e.g., Diamond Eternity Ring"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      {...register("slug")}
                      placeholder="diamond-eternity-ring"
                      className={errors.slug ? "border-destructive" : ""}
                    />
                    {errors.slug && (
                      <p className="text-xs text-destructive">{errors.slug.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
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
                </div>

                {/* Row 2: Product-type specific fields */}
                {isCouture ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="model_number">Model Number</Label>
                      <Input
                        id="model_number"
                        {...register("model_number")}
                        placeholder="e.g. CT-2024-001"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sku">Product Code</Label>
                      <Input
                        id="sku"
                        {...register("sku")}
                        placeholder="e.g. RNG-001"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="base_price">Price *</Label>
                      <Input
                        id="base_price"
                        type="number"
                        step="0.01"
                        {...register("base_price")}
                        placeholder="0.00"
                        className={errors.base_price ? "border-destructive" : ""}
                      />
                      {errors.base_price && (
                        <p className="text-xs text-destructive">{errors.base_price.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="compare_at_price">Compare at Price</Label>
                      <Input
                        id="compare_at_price"
                        type="number"
                        step="0.01"
                        {...register("compare_at_price")}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Row 3: Collections + Status toggles */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
                  <div className="space-y-1.5 flex-1">
                    <Label>Collections</Label>
                    {availableCollections && availableCollections.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableCollections.map((col) => (
                          <Button
                            key={col.id}
                            type="button"
                            variant={selectedCollections.includes(col.id) ? "default" : "outline"}
                            onClick={() =>
                              setSelectedCollections((prev) =>
                                prev.includes(col.id)
                                  ? prev.filter((cid) => cid !== col.id)
                                  : [...prev, col.id]
                              )
                            }
                          >
                            {col.name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No collections available.
                      </p>
                    )}
                  </div>
                  <Controller
                    control={control}
                    name="is_active"
                    render={({ field }) => (
                      <div className="flex items-center gap-1.5">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <Label className="font-normal text-sm">Active</Label>
                      </div>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Descriptions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="short_description">Short Description</Label>
                    <Controller
                      control={control}
                      name="short_description"
                      render={({ field }) => (
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="A brief tagline"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Full Description</Label>
                    <Controller
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <RichTextEditor
                          content={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Detailed description (optional)"
                        />
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Images (sticky on desktop) */}
          <div className="xl:sticky xl:top-6 xl:self-start space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Images</CardTitle>
                <CardDescription>Square images recommended (1000×1000px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Image */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Main Image *</Label>
                  {primaryImage ? (
                    <div className="relative aspect-square group">
                      <img
                        src={primaryImage.image_url}
                        alt="Main product"
                        className="h-full w-full object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => removeImage(images.findIndex((img) => img.is_primary))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                        <Star className="h-3 w-3" /> Primary
                      </div>
                    </div>
                  ) : (
                    <label
                      onDragOver={handleImageDragOver}
                      onDragLeave={handleImageDragLeave}
                      onDrop={handleImageDrop}
                      className={cn(
                        "flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                        isDraggingImage
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary hover:bg-muted/50",
                        isUploadingImages && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {isUploadingImages ? (
                        <>
                          <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground text-center px-4">
                            Drag & drop or click to browse
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImages}
                      />
                    </label>
                  )}
                </div>

                {/* Gallery Images */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Gallery</Label>
                  <div className="grid gap-2 grid-cols-3">
                    {galleryImages.map((img, i) => {
                      const realIndex = images.findIndex((im) => im === img);
                      return (
                        <div key={i} className="relative group aspect-square">
                          <img
                            src={img.image_url}
                            alt="Gallery"
                            className="h-full w-full object-cover rounded-lg border"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1 p-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="text-[10px] h-6 px-2 w-full"
                              onClick={() => setPrimaryImage(realIndex)}
                            >
                              Set Primary
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="h-6 w-full"
                              onClick={() => removeImage(realIndex)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 text-muted-foreground mb-0.5" />
                          <span className="text-[10px] text-muted-foreground">Add</span>
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Specifications - Full Width Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Specifications</CardTitle>
            <CardDescription>Only filled specs will be shown on the storefront.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Metals & Dimensions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Metals</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMetals((prev) => [
                        ...prev,
                        {
                          metal_type: "",
                          metal_weight: "",
                          display_order: prev.length,
                        },
                      ])
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Metal
                  </Button>
                </div>

                {metals.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded">
                    No metals added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {metals.map((metal, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Metal {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() =>
                              setMetals((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid gap-2 grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Type *</Label>
                            <Input
                              placeholder="18K Rose Gold"
                              value={metal.metal_type}
                              onChange={(e) =>
                                setMetals((prev) =>
                                  prev.map((m, i) =>
                                    i === index ? { ...m, metal_type: e.target.value } : m
                                  )
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Weight</Label>
                            <Input
                              placeholder="4.5g"
                              value={metal.metal_weight}
                              onChange={(e) =>
                                setMetals((prev) =>
                                  prev.map((m, i) =>
                                    i === index ? { ...m, metal_weight: e.target.value } : m
                                  )
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Gross Weight & Size - always visible */}
                <div className="grid gap-3 grid-cols-2 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label htmlFor="gross_weight" className="text-xs text-muted-foreground">Gross Weight</Label>
                    <Input id="gross_weight" placeholder="5.2g" {...register("gross_weight")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="size" className="text-xs text-muted-foreground">Size</Label>
                    <Input id="size" placeholder='16.5"' {...register("size")} />
                  </div>
                </div>
              </div>

              {/* Right: Stones Section */}
              <div className="space-y-4 lg:border-l lg:pl-6">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Stones</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setStones((prev) => [
                        ...prev,
                        {
                          stone_type: "",
                          stone_carat: "",
                          stone_color: "",
                          stone_clarity: "",
                          stone_cut: "",
                          display_order: prev.length,
                        },
                      ])
                    }
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Stone
                  </Button>
                </div>

                {stones.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded">
                    No stones added yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stones.map((stone, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Stone {index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() =>
                              setStones((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                          <div className="space-y-1">
                            <Label className="text-xs">Type *</Label>
                            <StoneTypeCombobox
                              value={stone.stone_type}
                              onChange={(newType) =>
                                setStones((prev) =>
                                  prev.map((s, i) =>
                                    i === index ? { ...s, stone_type: newType } : s
                                  )
                                )
                              }
                              placeholder="Select..."
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Weight</Label>
                            <Input
                              placeholder="7.94 ct"
                              value={stone.stone_carat}
                              onChange={(e) =>
                                setStones((prev) =>
                                  prev.map((s, i) =>
                                    i === index ? { ...s, stone_carat: e.target.value } : s
                                  )
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Color</Label>
                            <Input
                              placeholder="D"
                              value={stone.stone_color}
                              onChange={(e) =>
                                setStones((prev) =>
                                  prev.map((s, i) =>
                                    i === index ? { ...s, stone_color: e.target.value } : s
                                  )
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Clarity</Label>
                            <Input
                              placeholder="VVS1"
                              value={stone.stone_clarity}
                              onChange={(e) =>
                                setStones((prev) =>
                                  prev.map((s, i) =>
                                    i === index ? { ...s, stone_clarity: e.target.value } : s
                                  )
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Cut</Label>
                            <Input
                              placeholder="Excellent"
                              value={stone.stone_cut}
                              onChange={(e) =>
                                setStones((prev) =>
                                  prev.map((s, i) =>
                                    i === index ? { ...s, stone_cut: e.target.value } : s
                                  )
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
}
