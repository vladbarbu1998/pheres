/**
 * Archive utilities for checking product purchasability
 * Enforces archive rules server-side for cart/checkout operations
 */

interface ProductArchiveResult {
  productId: string;
  isEffectivelyArchived: boolean;
  isCouture: boolean;
  isPurchasable: boolean;
  reason?: "PRODUCT_ARCHIVED" | "COLLECTION_ARCHIVED" | "COUTURE_INQUIRY_ONLY";
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
    const productArchived = product.archived === true;

    // Check if ANY linked collection is archived
    const collectionArchived =
      product.product_collections?.some(
        (pc) => pc.collections?.archived === true
      ) ?? false;

    const isEffectivelyArchived = productArchived || collectionArchived;
    const isCouture = product.product_type === "couture";

    // Archived always wins, then couture check
    const isPurchasable = !isEffectivelyArchived && !isCouture;

    let reason: ProductArchiveResult["reason"];
    if (productArchived) {
      reason = "PRODUCT_ARCHIVED";
    } else if (collectionArchived) {
      reason = "COLLECTION_ARCHIVED";
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
 */
export function isEffectivelyArchived(product: ProductWithArchiveData): boolean {
  if (product.archived) return true;
  
  return product.product_collections?.some(
    (pc) => pc.collections?.archived === true
  ) ?? false;
}
