import type {
  CustomerAddressResponse,
  CustomerAddressFormValues,
} from "./types";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

export const getCustomerAddresses = async () => {
  return apiGet<CustomerAddressResponse>("/customer/addresses");
};

export const createCustomerAddresses = async (
  body: CustomerAddressFormValues,
) => {
  return apiPost<CustomerAddressResponse, CustomerAddressFormValues>(
    "/customer/addresses",
    body,
  );
};

export const updateCustomerAddresses = async (
  addressId: string,
  body: CustomerAddressFormValues,
) => {
  return apiPatch<CustomerAddressResponse, CustomerAddressFormValues>(
    `/customer/addresses/${addressId}`,
    body,
  );
};

export const deleteCustomerAddress = async (addressId: string) => {
  return apiDelete<CustomerAddressResponse>(`/customer/addresses/${addressId}`);
};
