import type {
  CustomerWishlistResponse,
  AddCustomerWishlistItemBody,
} from "./types";
import { apiDelete, apiGet, apiPost } from "@/lib/api";

export const getCustomerWishlist = async () => {
  return apiGet<CustomerWishlistResponse>("/customer/wishlist");
};

export const addCustomerWishlist = async (
  body: AddCustomerWishlistItemBody,
) => {
  return apiPost<CustomerWishlistResponse>(`/customer/wishlist/items`, body);
};

export const removeCustomerWishlist = async (productId: string) => {
  return apiDelete<CustomerWishlistResponse>(
    `/customer/wishlist/items/${productId}`,
  );
};
