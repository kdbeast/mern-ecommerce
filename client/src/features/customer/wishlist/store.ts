import { toast } from "sonner";
import { create } from "zustand";
import type { CustomerWishlistItem } from "./types";
import { getCustomerWishlist, removeCustomerWishlist } from "./api";

type CustomerWishlistState = {
  items: CustomerWishlistItem[];
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  setItems: (items: CustomerWishlistItem[]) => void;
  loadWishlist: () => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => void;
};

export const useCustomerWishlistStore = create<CustomerWishlistState>(
  (set) => ({
    items: [],
    isOpen: false,
    setOpen: (value) => set({ isOpen: value }),
    setItems: (items) => set({ items }),
    loadWishlist: async () => {
      try {
        const response = await getCustomerWishlist();
        set({ items: response?.items ?? [] });
      } catch {
        set({ items: [] });
      }
    },
    removeItem: async (productId) => {
      try {
        const response = await removeCustomerWishlist(productId);
        set({ items: response?.items ?? [] });
        toast.success("Product removed from wishlist");
      } catch {
        toast.error("Failed to remove wishlist product");
      }
    },
    clear: () => set({ items: [], isOpen: false }),
  }),
);
