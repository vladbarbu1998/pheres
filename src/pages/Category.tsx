import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";
import { ErrorState } from "@/components/shop/ErrorState";
import { Pagination } from "@/components/shop/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCategory, useProducts } from "@/hooks/useProducts";
import { useState } from "react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const {
    data: category,
    isLoading: categoryLoading,
    isError: categoryError,
    refetch: refetchCategory,
  } = useCategory(slug || "");

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useProducts({
    filters: { categoryId: category?.id || null, collectionId: null, minPrice: null, maxPrice: null, stoneType: null },
    page,
    pageSize: 12,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLoading = categoryLoading || productsLoading;
  const isError = categoryError || productsError;
  const products = productsData?.products || [];
  const totalPages = productsData?.totalPages || 1;

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
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/shop">Shop</Link>
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
            title="No products yet"
            description="This category doesn't have any products yet. Check back soon!"
            actionLabel="Browse all products"
            actionHref="/shop"
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
      </section>
    </Layout>
  );
}
