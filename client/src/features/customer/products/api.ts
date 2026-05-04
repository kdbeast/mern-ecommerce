import type {
  ProductCategory,
  CustomerProduct,
  GetCustomerProductsParams,
  CustomerProductDetailsResponse,
} from "./types";
import { apiGet } from "@/lib/api";

export const getCustomerCategories = async () => {
  return apiGet<ProductCategory[]>("/customer/categories");
};

export const getCustomerProducts = async (
  params?: GetCustomerProductsParams,
) => {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set("category", params.category);
  if (params?.brand) searchParams.set("brand", params.brand);
  if (params?.color) searchParams.set("color", params.color);
  if (params?.size) searchParams.set("size", params.size);
  if (params?.sort) searchParams.set("sort", params.sort);

  const queryString = searchParams.toString();

  const url = queryString
    ? `/customer/products?${queryString}`
    : `/customer/products`;

  return apiGet<CustomerProduct[]>(url);
};

export const getCustomerProductDetails = async (productId: string) => {
  return apiGet<CustomerProductDetailsResponse>(
    `/customer/products/${productId}`,
  );
};
