import { create } from "zustand";
import { getCustomerOrders, returnCustomerOrder } from "./api";
import type { CustomerOrder } from "./types";

type CustomerOrdersStore = {
  isOpen: boolean;
  loading: boolean;
  items: CustomerOrder[];
  openOrders: () => Promise<void>;
  closeOrders: () => void;
  loadOrders: () => Promise<void>;
  returnOrder: (orderId: string) => Promise<void>;
  clear: () => void;
};

export const useCustomerOrdersStore = create<CustomerOrdersStore>(
  (set, get) => ({
    isOpen: false,
    loading: false,
    items: [],
    loadOrders: async () => {
      try {
        set({ loading: true });
        const response = await getCustomerOrders();
        set({ items: response.items ?? [] });
      } catch {
        set({ items: [], loading: false });
      } finally {
        set({ loading: false });
      }
    },
    openOrders: async () => {
      set({ isOpen: true });
      await get().loadOrders();
    },
    closeOrders: () => set({ isOpen: false }),
    clear: () => set({ isOpen: false, loading: false, items: [] }),
    returnOrder: async (orderId: string) => {
      const response = await returnCustomerOrder(orderId);
      set((state) => ({
        items: state.items.map((item) =>
          item._id === orderId
            ? {
                ...item,
                orderStatus: response?.orderStatus ?? item.orderStatus,
                returnedAt: response?.returnedAt ?? item.returnedAt ?? null,
              }
            : item,
        ),
      }));
    },
  }),
);
