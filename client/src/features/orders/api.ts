import type {
  CustomerOrdersResponse,
  CustomerReturnOrderResponse,
} from "./types";
import { apiGet, apiPatch } from "@/lib/api";

export const getCustomerOrders = async () => {
  return apiGet<CustomerOrdersResponse>("/customer/orders");
};

export const returnCustomerOrder = async (orderId: string) => {
  return apiPatch<CustomerReturnOrderResponse>(
    `/customer/orders/${orderId}/return`,
  );
};
