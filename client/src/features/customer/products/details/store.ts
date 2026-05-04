import {
  addCustomerWishlist,
  removeCustomerWishlist,
} from "../../wishlist/api";
import { toast } from "sonner";
import { create } from "zustand";
import { getCustomerProductDetails } from "../api";
import { getCoverImage } from "../product-list-shared";
import { useCustomerWishlistStore } from "../../wishlist/store";
import type { CustomerProductDetailsResponse, ProductSize } from "../types";

type CustomerProductDetailsStore = {
  loading: boolean;
  data: CustomerProductDetailsResponse | null;
  selectedImage: string;
  selectedColor: string;
  selectedSize: ProductSize | "";
  loadProduct: (productId: string) => Promise<void>;
  clear: () => void;
  setSelectedImage: (value: string) => void;
  setSelectedColor: (value: string) => void;
  setSelectedSize: (value: ProductSize | "") => void;
  addToCart: (
    isLoaded: boolean,
    isBootstrapped: boolean,
    isSignedIn: boolean,
  ) => Promise<void>;
  toggleWishlist: (
    isLoaded: boolean,
    isBootstrapped: boolean,
    isSignedIn: boolean,
    isWishlistActive: boolean,
  ) => Promise<void>;
};

const defaultState = {
  loading: true,
  data: null,
  selectedImage: "",
  selectedColor: "",
  selectedSize: "" as ProductSize | "",
};

export const useCustomerProductDetailsStore =
  create<CustomerProductDetailsStore>((set, get) => ({
    ...defaultState,
    loadProduct: async (productId) => {
      if (!productId) {
        set(() => ({
          data: null,
          loading: false,
          selectedImage: "",
          selectedColor: "",
          selectedSize: "",
        }));
      }

      set(() => ({
        loading: true,
        data: null,
        selectedImage: "",
        selectedColor: "",
        selectedSize: "",
      }));

      try {
        const response = await getCustomerProductDetails(productId);
        const product = response?.product ?? null;
        set(() => ({
          loading: false,
          data: response ?? null,
          selectedImage: product ? getCoverImage(product) : "",
          selectedColor: product?.colors?.[0] ?? "",
          selectedSize: product?.sizes?.[0] ?? "",
        }));
      } catch (error) {
        console.error("Failed to load product", error);
        set(() => ({
          data: null,
          loading: false,
          selectedImage: "",
          selectedColor: "",
          selectedSize: "",
        }));
      }
    },

    clear: () => {
      set(() => defaultState);
    },

    setSelectedImage: (value) => {
      set(() => ({ selectedImage: value }));
    },

    setSelectedColor: (value) => {
      set(() => ({ selectedColor: value }));
    },

    setSelectedSize: (value) => {
      set(() => ({ selectedSize: value }));
    },

    addToCart: async (isLoaded, isBootstrapped, isSignedIn) => {
      console.log("isLoaded", isLoaded);
      console.log("isBootstrapped", isBootstrapped);
      console.log("isSignedIn", isSignedIn);
    },

    toggleWishlist: async (
      isLoaded,
      isBootstrapped,
      isSignedIn,
      isWishlistActive,
    ) => {
      const product = get().data?.product ?? null;

      if (!product) {
        return;
      }

      if (!isLoaded || !isBootstrapped || !isSignedIn) {
        toast.error("Please sign in to add this product to your wishlist");
        return;
      }

      try {
        if (isWishlistActive) {
          const response = await removeCustomerWishlist(product._id);
          useCustomerWishlistStore.getState().setItems(response?.items ?? []);
          toast.success(`${product?.title} removed from wishlist`);
        } else {
          const response = await addCustomerWishlist({
            productId: product._id,
          });
          useCustomerWishlistStore.getState().setItems(response?.items ?? []);
          toast.success(`${product?.title} saved to wishlist`);
        }
      } catch {
        toast.error("Failed to toggle wishlist items");
      }
    },
  }));
