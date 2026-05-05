import { create } from "zustand";
import type { AdminOrder, AdminOrderStatus } from "./types";
import { extractAdminOrders, updateAdminOrderStatus } from "./api";

type AdminOrdersStore = {
  orders: AdminOrder[];
  loading: boolean;
  updatingOrderId: string;
  fetchOrders: () => Promise<void>;
  changeStatus: (
    orderId: string,
    orderStatus: AdminOrderStatus,
  ) => Promise<void>;
};

export const useAdminOrdersStore = create<AdminOrdersStore>((set) => ({
  orders: [],
  loading: true,
  updatingOrderId: "",
  fetchOrders: async () => {
    try {
      set({ loading: true });

      const response = await extractAdminOrders();
      set({
        orders: response?.items ?? [],
        loading: false,
      });
    } catch {
      set({
        orders: [],
        loading: false,
      });
    }
  },
  changeStatus: async (orderId, orderStatus) => {
    try {
      set({ updatingOrderId: orderId });

      await updateAdminOrderStatus(orderId, orderStatus);

      // Refetch orders after successful update
      const response = await extractAdminOrders();
      set({
        orders: response?.items ?? [],
        updatingOrderId: "",
      });
    } catch {
      set({ updatingOrderId: "" });
    }
  },
}));
