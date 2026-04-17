"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";
import { ErrorState } from "@/components/shop/ErrorState";
import { Pagination } from "@/components/shop/Pagination";
import {
  ShopFilters,
  ShopFiltersSidebar,
  type FilterState,
  type SortOption,
} from "@/components/shop/ShopFilters";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  useCategory,
  useProducts,
  useCollections,
  useCategoryFilterOptions,
} from "@/hooks/useProducts";

const initialFilters: FilterState = {
  categoryIds: [],
  collectionIds: [],
  minPrice: null,
  maxPrice: null,
  stoneTypes: [],
};

export default function CategoryPage() {
  const { slug } = (useParams() as unknown as { slug: string });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);

  const sortParam = searchParams.get("sort") as SortOption | null;
  const sortBy: SortOption = sortParam || "newest";

  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
    refetch: refetchCategory,
  } = useCategory(slug || "");

  const { data: allCollections, isLoading: collectionsLoading } = useCollections();
  const { data: filterOptionsData, isLoading: filterOptionsLoading } =
    useCategoryFilterOptions(slug || "");

  // Build filters with category ID
  const activeFilters = useMemo(() => ({
    ...filters,
    categoryId: category?.id || null,
  }), [filters, category?.id]);

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts({
    filters: activeFilters,
    sortBy,
    page,
    pageSize: 12,
    productType: "ready_to_wear",
  });

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    // Don't allow changing categoryIds from filters on category page
    setFilters({
      ...newFilters,
      categoryIds: [], // Keep empty, we use category from URL
    });
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  // Filter collections to only show those with products in this category
  const activeCollectionIds = filterOptionsData?.activeCollectionIds || [];
  const collections = useMemo(
    () => (allCollections || []).filter((c) => activeCollectionIds.includes(c.id)),
    [allCollections, activeCollectionIds]
  );

  // Get stone types from products in this category
  const stoneTypes = filterOptionsData?.stoneTypes || [];

  const isLoading =
    categoryLoading || productsLoading || collectionsLoading || filterOptionsLoading;
  const isError = categoryError || productsError;
  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = productsData?.totalPages || 1;
  
  // Check if non-category filters are active
  const hasActiveFilters = 
    filters.collectionIds.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.stoneTypes.length > 0;

  // Category not found
  if (!categoryLoading && !category && !categoryError) {
    return (
      <Layout>
        <section className="container py-16">
          <EmptyState
            title="Category not found"
            description="The category you're looking for doesn't exist or may have been removed."
            actionLabel="Browse all products"
            actionHref="/shop"
          />
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
            {/* Hero Section */}
      <section className="relative border-b border-border">
        {/* Background image */}
        {category?.image_url && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={category.image_url}
              alt=""
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
          </div>
        )}

        <div className="container relative py-12 lg:py-20">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category?.name || "Category"}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {categoryLoading ? (
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="mx-auto h-10 w-64" />
              <Skeleton className="mx-auto mt-4 h-5 w-full max-w-md" />
            </div>
          ) : (
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="mt-4 text-base text-muted-foreground lg:text-lg">
                  {category.description}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="container py-8 lg:py-12">
        {/* Filters Bar */}
        <ShopFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          categories={[]} // Don't show category filter on category page
          collections={collections}
          productCount={totalCount}
          isLoading={isLoading}
          stoneTypes={stoneTypes}
        />

        {/* Content Grid */}
        <div className="mt-8 flex gap-8 lg:gap-12">
          {/* Desktop Sidebar */}
          <ShopFiltersSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={[]} // Don't show category filter on category page
            collections={collections}
            stoneTypes={stoneTypes}
          />

          {/* Products */}
          <div className="flex-1">
            {isError ? (
              <ErrorState
                onRetry={() => {
                  refetchCategory();
                  refetchProducts();
                }}
              />
            ) : isLoading ? (
              <ProductGrid products={[]} isLoading skeletonCount={8} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  hasActiveFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "This category doesn't have any products yet. Check back soon!"
                }
                actionLabel={hasActiveFilters ? "Clear filters" : "Browse all products"}
                onAction={hasActiveFilters ? handleClearFilters : undefined}
                actionHref={hasActiveFilters ? undefined : "/shop"}
              />
            ) : (
              <>
                <ProductGrid products={products} />
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-12"
                />
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}