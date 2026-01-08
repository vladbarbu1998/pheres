import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    image_url: string | null;
    category_slug: string | null;
    product_type: string | null;
    couture_collection_slug: string | null;
  };
  variant?: {
    id: string;
    name: string;
    price_adjustment: number;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  updatingItems: Set<string>; // Track which items are being updated
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, variantId: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = "pheres_guest_cart";

interface GuestCartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

function getGuestCart(): GuestCartItem[] {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    setIsLoading(true);

    if (user) {
      // Fetch from database for authenticated users
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          variant_id,
          quantity,
          products (
            id,
            name,
            slug,
            base_price,
            product_type,
            categories (
              slug
            ),
            product_images (
              image_url,
              is_primary
            ),
            product_collections (
              collections (
                slug,
                collection_type
              )
            )
          ),
          product_variants (
            id,
            name,
            price_adjustment
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching cart:", error);
        setItems([]);
      } else {
        const cartItems: CartItem[] = (data || []).map((item: any) => {
          const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary);
          const firstImage = item.products?.product_images?.[0];
          
          // Find couture collection if exists
          const coutureCollection = item.products?.product_collections?.find(
            (pc: any) => pc.collections?.collection_type === "couture"
          )?.collections;
          
          return {
            id: item.id,
            productId: item.product_id,
            variantId: item.variant_id,
            quantity: item.quantity,
            product: {
              id: item.products?.id,
              name: item.products?.name,
              slug: item.products?.slug,
              base_price: item.products?.base_price,
              image_url: primaryImage?.image_url || firstImage?.image_url || null,
              category_slug: item.products?.categories?.slug || null,
              product_type: item.products?.product_type || null,
              couture_collection_slug: coutureCollection?.slug || null,
            },
            variant: item.product_variants ? {
              id: item.product_variants.id,
              name: item.product_variants.name,
              price_adjustment: item.product_variants.price_adjustment,
            } : null,
          };
        });
        setItems(cartItems);
      }
    } else {
      // Fetch from localStorage for guests
      const guestCart = getGuestCart();
      
      if (guestCart.length === 0) {
        setItems([]);
      } else {
        // Fetch product details for guest cart items
        const productIds = [...new Set(guestCart.map(item => item.productId))];
        const variantIds = guestCart.map(item => item.variantId).filter(Boolean) as string[];

        const { data: products } = await supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            base_price,
            product_type,
            categories (
              slug
            ),
            product_images (
              image_url,
              is_primary
            ),
            product_collections (
              collections (
                slug,
                collection_type
              )
            )
          `)
          .in("id", productIds)
          .eq("is_active", true);

        const { data: variants } = variantIds.length > 0
          ? await supabase
              .from("product_variants")
              .select("id, name, price_adjustment")
              .in("id", variantIds)
          : { data: [] };

        const cartItems: CartItem[] = guestCart
          .map((guestItem, index) => {
            const product = products?.find(p => p.id === guestItem.productId);
            if (!product) return null;

            const primaryImage = (product as any).product_images?.find((img: any) => img.is_primary);
            const firstImage = (product as any).product_images?.[0];
            const variant = variants?.find(v => v.id === guestItem.variantId);
            
            // Find couture collection if exists
            const coutureCollection = (product as any).product_collections?.find(
              (pc: any) => pc.collections?.collection_type === "couture"
            )?.collections;

            return {
              id: `guest-${index}`,
              productId: guestItem.productId,
              variantId: guestItem.variantId,
              quantity: guestItem.quantity,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                base_price: product.base_price,
                image_url: primaryImage?.image_url || firstImage?.image_url || null,
                category_slug: (product as any).categories?.slug || null,
                product_type: (product as any).product_type || null,
                couture_collection_slug: coutureCollection?.slug || null,
              },
              variant: variant ? {
                id: variant.id,
                name: variant.name,
                price_adjustment: variant.price_adjustment,
              } : null,
            };
          })
          .filter(Boolean) as CartItem[];

        setItems(cartItems);
      }
    }

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addItem = useCallback(async (productId: string, variantId: string | null, quantity = 1) => {
    if (user) {
      // Check if item already exists
      const existingItem = items.find(
        item => item.productId === productId && item.variantId === variantId
      );

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id);

        if (error) {
          toast({ title: "Error", description: "Could not update cart", variant: "destructive" });
          return;
        }
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            variant_id: variantId,
            quantity,
          });

        if (error) {
          toast({ title: "Error", description: "Could not add to cart", variant: "destructive" });
          return;
        }
      }

      await fetchCart();
      toast({ title: "Added to cart", description: "Item has been added to your cart" });
    } else {
      // Guest cart
      const guestCart = getGuestCart();
      const existingIndex = guestCart.findIndex(
        item => item.productId === productId && item.variantId === variantId
      );

      if (existingIndex >= 0) {
        guestCart[existingIndex].quantity += quantity;
      } else {
        guestCart.push({ productId, variantId, quantity });
      }

      setGuestCart(guestCart);
      await fetchCart();
      toast({ title: "Added to cart", description: "Item has been added to your cart" });
    }
  }, [user, items, fetchCart]);

  // Update quantity with optimistic update
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    // Find the item and store previous quantity for rollback
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const previousQuantity = items[itemIndex].quantity;
    
    // Optimistic update
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
    
    // Mark as updating
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      if (user) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("id", itemId);

        if (error) throw error;
      } else {
        // Guest cart - itemId is like "guest-0"
        const index = parseInt(itemId.replace("guest-", ""));
        const guestCart = getGuestCart();
        
        if (guestCart[index]) {
          guestCart[index].quantity = quantity;
          setGuestCart(guestCart);
        }
      }
    } catch (error) {
      // Rollback on error
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: previousQuantity } : item
      ));
      toast({ title: "Error", description: "Could not update quantity. Please try again.", variant: "destructive" });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [user, items]);

  // Remove item with optimistic update
  const removeItem = useCallback(async (itemId: string) => {
    // Store previous items for rollback
    const previousItems = [...items];
    
    // Optimistic remove
    setItems(prev => prev.filter(item => item.id !== itemId));
    
    // Mark as updating
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      if (user) {
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId);

        if (error) throw error;
      } else {
        const index = parseInt(itemId.replace("guest-", ""));
        const guestCart = getGuestCart();
        guestCart.splice(index, 1);
        setGuestCart(guestCart);
      }
      
      toast({ title: "Removed", description: "Item removed from cart" });
    } catch (error) {
      // Rollback on error
      setItems(previousItems);
      toast({ title: "Error", description: "Could not remove item. Please try again.", variant: "destructive" });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, [user, items]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
    }
    setItems([]);
  }, [user]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.base_price + (item.variant?.price_adjustment || 0);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        updatingItems,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
