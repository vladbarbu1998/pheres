/**
 * Archive utilities for checking product purchasability
 * Enforces archive rules server-side for cart/checkout operations
 */

interface ProductArchiveResult {
  productId: string;
  isEffectivelyArchived: boolean;
  isCouture: boolean;
  isPurchasable: boolean;
  reason?: "PRODUCT_ARCHIVED" | "COUTURE_INQUIRY_ONLY";
}

interface ProductWithArchiveData {
  id: string;
  archived: boolean;
  product_type: "couture" | "ready_to_wear";
  product_collections?: Array<{
    collections?: {
      archived: boolean;
    } | null;
  }> | null;
}

/**
 * Check purchasability for multiple products
 * Returns detailed status for each product including archive and couture checks
 * 
 * Priority order:
 * 1. Product archived directly → not purchasable
 * 2. Collection archived → not purchasable  
 * 3. Couture product type → not purchasable (inquiry only)
 * 4. Otherwise → purchasable
 */
export function checkProductsPurchasability(
  products: ProductWithArchiveData[]
): ProductArchiveResult[] {
  return products.map((product) => {
    // Only the product's own archived flag matters now
    // (collection archive cascades to products via database trigger)
    const isEffectivelyArchived = product.archived === true;
    const isCouture = product.product_type === "couture";

    // Archived always wins, then couture check
    const isPurchasable = !isEffectivelyArchived && !isCouture;

    let reason: ProductArchiveResult["reason"];
    if (isEffectivelyArchived) {
      reason = "PRODUCT_ARCHIVED";
    } else if (isCouture) {
      reason = "COUTURE_INQUIRY_ONLY";
    }

    return {
      productId: product.id,
      isEffectivelyArchived,
      isCouture,
      isPurchasable,
      reason,
    };
  });
}

/**
 * Check if a single product is effectively archived
 * Only the product's own archived flag matters now
 * (collection archive cascades to products via database trigger)
 */
export function isEffectivelyArchived(product: ProductWithArchiveData): boolean {
  return product.archived === true;
}
