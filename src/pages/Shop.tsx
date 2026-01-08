import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import {
  ShopFilters,
  ShopFiltersSidebar,
  type FilterState,
  type SortOption,
} from "@/components/shop/ShopFilters";
import { EmptyState } from "@/components/shop/EmptyState";
import { ErrorState } from "@/components/shop/ErrorState";
import { Pagination } from "@/components/shop/Pagination";
import { useProducts, useCategories, useCollections, useProductFilterOptions } from "@/hooks/useProducts";

const initialFilters: FilterState = {
  categoryIds: [],
  collectionIds: [],
  minPrice: null,
  maxPrice: null,
  stoneTypes: [],
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const sortParam = searchParams.get("sort") as SortOption | null;
  const sortBy: SortOption = sortParam || "featured";
  const collectionSlugParam = searchParams.get("collection");

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections();
  const { data: filterOptionsData, isLoading: filterOptionsLoading } = useProductFilterOptions();

  // Initialize collection filter from URL param
  useEffect(() => {
    if (!initialized && collectionsData && collectionSlugParam) {
      const collection = collectionsData.find(c => c.slug === collectionSlugParam);
      if (collection) {
        setFilters(prev => ({
          ...prev,
          collectionIds: [collection.id],
        }));
      }
      setInitialized(true);
    } else if (!initialized && !collectionSlugParam) {
      setInitialized(true);
    }
  }, [collectionsData, collectionSlugParam, initialized]);

  const {
    data: productsData,
    isLoading: productsLoading,
    isError,
    refetch,
  } = useProducts({
    filters,
    sortBy,
    page,
    pageSize: 12,
    productType: "ready_to_wear",
  });

  const handleSortChange = (sort: SortOption) => {
    setSearchParams({ sort });
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

  const allCategories = categoriesData || [];
  const allCollections = collectionsData || [];
  const products = productsData?.products || [];
  const totalCount = productsData?.totalCount || 0;
  const totalPages = productsData?.totalPages || 1;

  // Filter categories to only show those with active products
  const activeCategoryIds = filterOptionsData?.activeCategoryIds || [];
  const categories = useMemo(
    () => allCategories.filter((c) => activeCategoryIds.includes(c.id)),
    [allCategories, activeCategoryIds]
  );

  // Filter collections to only show those with active products
  const activeCollectionIds = filterOptionsData?.activeCollectionIds || [];
  const collections = useMemo(
    () => allCollections.filter((c) => activeCollectionIds.includes(c.id)),
    [allCollections, activeCollectionIds]
  );

  // Get dynamic stone types from active products
  const stoneTypes = filterOptionsData?.stoneTypes || [];

  const isLoading = productsLoading || categoriesLoading || collectionsLoading || filterOptionsLoading;
  const hasActiveFilters = 
    filters.categoryIds.length > 0 ||
    filters.collectionIds.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.stoneTypes.length > 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container py-12 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              Shop Collection
            </h1>
            <p className="mt-4 text-base text-muted-foreground lg:text-lg">
              Discover exquisite pieces crafted with the finest materials and timeless elegance.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-8 lg:py-12">
        {/* Filters Bar */}
        <ShopFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          categories={categories}
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
            categories={categories}
            collections={collections}
            stoneTypes={stoneTypes}
          />

          {/* Products */}
          <div className="flex-1">
            {isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : isLoading ? (
              <ProductGrid products={[]} isLoading skeletonCount={12} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description={
                  hasActiveFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Check back soon for new arrivals."
                }
                actionLabel={hasActiveFilters ? "Clear filters" : undefined}
                onAction={hasActiveFilters ? handleClearFilters : undefined}
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
