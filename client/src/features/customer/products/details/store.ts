import { create } from "zustand";
import type { CustomerProductDetailsResponse, ProductSize } from "../types";
import { getCustomerProductDetails } from "../api";
import { getCoverImage } from "../product-list-shared";

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
  create<CustomerProductDetailsStore>((set) => ({
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
      console.log("isLoaded", isLoaded);
      console.log("isBootstrapped", isBootstrapped);
      console.log("isSignedIn", isSignedIn);
      console.log("isWishlistActive", isWishlistActive);
    },
  }));
