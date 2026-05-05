import type {
  AdminOrdersResponse,
  AdminOrderStatus,
  AdminUpdateOrderStatusResponse,
} from "./types";
import { apiGet, apiPatch } from "@/lib/api";

export const extractAdminOrders = () => {
  return apiGet<AdminOrdersResponse>("/admin/orders");
};

export const updateAdminOrderStatus = (
  orderId: string,
  orderStatus: AdminOrderStatus,
) => {
  return apiPatch<
    AdminUpdateOrderStatusResponse,
    { orderStatus: AdminOrderStatus }
  >(`/admin/orders/${orderId}/status`, { orderStatus });
};
