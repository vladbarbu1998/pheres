"use client";

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  useCollection,
  useProducts,
  useCategories,
  useCollectionFilterOptions,
} from "@/hooks/useProducts";

const initialFilters: FilterState = {
  categoryIds: [],
  collectionIds: [],
  minPrice: null,
  maxPrice: null,
  stoneTypes: [],
};

export default function CoutureCollectionPage() {
  const { collectionSlug } = (useParams() as unknown as { collectionSlug: string });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);

  // For Couture, default sort to "featured" instead of price-related
  const sortParam = searchParams.get("sort") as SortOption | null;
  const sortBy: SortOption = sortParam || "featured";

  const {
    data: collection,
    isLoading: collectionLoading,
    isError: collectionError,
    refetch: refetchCollection,
  } = useCollection(collectionSlug || "");

  const { data: allCategories, isLoading: categoriesLoading } = useCategories();
  const { data: filterOptionsData, isLoading: filterOptionsLoading } =
    useCollectionFilterOptions(collectionSlug || "");

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts({
    collectionSlug,
    filters,
    sortBy,
    page,
    pageSize: 12,
  });

  const handleSortChange = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    router.push(`${pathname}?${params.toString()}`);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
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

  // Filter categories to only show those with products in this collection
  const activeCategoryIds = filterOptionsData?.activeCategoryIds || [];
  const categories = useMemo(
    () => (allCategories || []).filter((c) => activeCategoryIds.includes(c.id)),
    [allCategories, activeCategoryIds]
  );

  // Get stone types from products in this collection
  const stoneTypes = filterOptionsData?.stoneTypes || [];

  const isLoading =
    collectionLoading || productsLoading || categoriesLoading || filterOptionsLoading;
  const isError = collectionError || productsError;
  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = productsData?.totalPages || 1;
  const hasActiveFilters = 
    filters.categoryIds.length > 0 ||
    filters.stoneTypes.length > 0;

  // Collection not found
  if (!collectionLoading && !collection && !collectionError) {
    return (
      <Layout>
        <section className="container py-16">
          <EmptyState
            title="Collection not found"
            description="The collection you're looking for doesn't exist or may have been removed."
            actionLabel="Browse Couture"
            actionHref="/collections/couture"
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
        {collection?.image_url && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={collection.image_url}
              alt=""
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
          </div>
        )}

        <div className="container relative py-12 lg:py-20">
          {/* Back link */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/collections/couture">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Couture Collections
            </Link>
          </Button>

          {collectionLoading ? (
            <div className="mx-auto max-w-2xl text-center">
              <Skeleton className="mx-auto h-10 w-64" />
              <Skeleton className="mx-auto mt-4 h-5 w-full max-w-md" />
            </div>
          ) : (
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-2 font-label text-xs font-medium uppercase tracking-[0.3em] text-primary">
                Couture Collection
              </p>
              <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl animate-fade-in text-balance">
                {collection?.name}
              </h1>
              {collection?.description && (
                <div 
                  className="mt-4 prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed lg:text-lg"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(collection.description) }}
                />
              )}
              {collection?.archived && (
                <p className="mt-4 text-sm text-muted-foreground italic">
                  This PHERES couture collection is part of our archive and is no longer available for new inquiries.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="container py-8 lg:py-12">
        {/* Filters Bar - hide price filters for Couture */}
        <ShopFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          categories={categories}
          collections={[]}
          productCount={totalCount}
          isLoading={isLoading}
          stoneTypes={stoneTypes}
          hidePriceFilters
        />

        {/* Content Grid */}
        <div className="mt-8 flex gap-8 lg:gap-12">
          {/* Desktop Sidebar - hide price filters for Couture */}
          <ShopFiltersSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            categories={categories}
            collections={[]}
            stoneTypes={stoneTypes}
            hidePriceFilters
          />

          {/* Products */}
          <div className="flex-1">
            {isError ? (
              <ErrorState
                onRetry={() => {
                  refetchCollection();
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
                    : "This collection doesn't have any products yet. Check back soon!"
                }
                actionLabel={hasActiveFilters ? "Clear filters" : "Browse Couture"}
                onAction={hasActiveFilters ? handleClearFilters : undefined}
                actionHref={hasActiveFilters ? undefined : "/collections/couture"}
              />
            ) : (
              <>
                <ProductGrid 
                  products={products} 
                  coutureCollectionSlug={collectionSlug}
                />
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