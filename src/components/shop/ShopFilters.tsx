import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface FilterState {
  categoryId: string | null;
  collectionId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  stoneType: string | null;
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "alpha-asc" | "alpha-desc" | "oldest" | "newest" | "bestsellers";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface ShopFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  categories: Category[];
  collections: Collection[];
  productCount: number;
  isLoading?: boolean;
  stoneTypes?: string[];
}

const priceRanges = [
  { label: "Under $1,000", min: null, max: 1000 },
  { label: "$1,000 - $5,000", min: 1000, max: 5000 },
  { label: "$5,000 - $10,000", min: 5000, max: 10000 },
  { label: "$10,000 - $25,000", min: 10000, max: 25000 },
  { label: "Over $25,000", min: 25000, max: null },
];

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <h4 className="mb-3 font-display text-sm font-semibold tracking-wide">
        {title}
      </h4>
      {children}
    </div>
  );
}

function FilterContent({
  filters,
  onFiltersChange,
  categories,
  collections,
  stoneTypes = [],
}: Pick<ShopFiltersProps, "filters" | "onFiltersChange" | "categories" | "collections" | "stoneTypes">) {
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      categoryId: checked ? categoryId : null,
    });
  };

  const handleCollectionChange = (collectionId: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      collectionId: checked ? collectionId : null,
    });
  };

  const handlePriceChange = (min: number | null, max: number | null, checked: boolean) => {
    onFiltersChange({
      ...filters,
      minPrice: checked ? min : null,
      maxPrice: checked ? max : null,
    });
  };

  const handleStoneChange = (stone: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      stoneType: checked ? stone : null,
    });
  };

  return (
    <div className="divide-y divide-border">
      {/* Collections - First */}
      {collections.length > 0 && (
        <FilterSection title="Collection">
          <div className="space-y-2">
            {collections.map((collection) => (
              <div key={collection.id} className="flex items-center gap-2">
                <Checkbox
                  id={`col-${collection.id}`}
                  checked={filters.collectionId === collection.id}
                  onCheckedChange={(checked) =>
                    handleCollectionChange(collection.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`col-${collection.id}`}
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  {collection.name}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={filters.categoryId === category.id}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price">
        <div className="space-y-2">
          {priceRanges.map((range, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                id={`price-${index}`}
                checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                onCheckedChange={(checked) =>
                  handlePriceChange(range.min, range.max, checked as boolean)
                }
              />
              <Label
                htmlFor={`price-${index}`}
                className="text-sm font-normal text-muted-foreground cursor-pointer"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Stone Type */}
      {stoneTypes.length > 0 && (
        <FilterSection title="Stone">
          <div className="space-y-2">
            {stoneTypes.map((stone) => (
              <div key={stone} className="flex items-center gap-2">
                <Checkbox
                  id={`stone-${stone}`}
                  checked={filters.stoneType === stone}
                  onCheckedChange={(checked) =>
                    handleStoneChange(stone, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`stone-${stone}`}
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  {stone}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

export function ShopFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  categories,
  collections,
  productCount,
  isLoading,
  stoneTypes = [],
}: ShopFiltersProps) {
  const hasActiveFilters =
    filters.categoryId ||
    filters.collectionId ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.stoneType;

  const clearFilters = () => {
    onFiltersChange({
      categoryId: null,
      collectionId: null,
      minPrice: null,
      maxPrice: null,
      stoneType: null,
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* Mobile filter sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="font-display">Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent
                filters={filters}
                onFiltersChange={onFiltersChange}
                categories={categories}
                collections={collections}
                stoneTypes={stoneTypes}
              />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4 w-full"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Product count */}
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading..."
          ) : (
            <>
              {productCount} {productCount === 1 ? "product" : "products"}
            </>
          )}
        </p>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="hidden items-center gap-2 lg:flex">
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear all
              <X className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Sort dropdown */}
      <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Featured</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="alpha-asc">Alphabetically: A-Z</SelectItem>
          <SelectItem value="alpha-desc">Alphabetically: Z-A</SelectItem>
          <SelectItem value="oldest">Oldest to Newest</SelectItem>
          <SelectItem value="newest">Newest to Oldest</SelectItem>
          <SelectItem value="bestsellers">Best Selling</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// Export desktop sidebar version
export function ShopFiltersSidebar({
  filters,
  onFiltersChange,
  categories,
  collections,
  stoneTypes = [],
}: Pick<ShopFiltersProps, "filters" | "onFiltersChange" | "categories" | "collections" | "stoneTypes">) {
  const hasActiveFilters =
    filters.categoryId ||
    filters.collectionId ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.stoneType;

  const clearFilters = () => {
    onFiltersChange({
      categoryId: null,
      collectionId: null,
      minPrice: null,
      maxPrice: null,
      stoneType: null,
    });
  };

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
              Clear all
            </Button>
          )}
        </div>
        <FilterContent
          filters={filters}
          onFiltersChange={onFiltersChange}
          categories={categories}
          collections={collections}
          stoneTypes={stoneTypes}
        />
      </div>
    </aside>
  );
}
