import { create } from "zustand";
import type { AppUser } from "@/lib/types";

type AuthStatus = "idle" | "loading" | "ready" | "error";

type AuthStore = {
  status: AuthStatus;
  isBootstrapped: boolean;
  user: AppUser | null;
  error: string | null;

  setLoading: () => void;
  setUser: (user: AppUser | null) => void;
  setError: (message: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  status: "idle",
  isBootstrapped: false,
  user: null,
  error: null,

  setLoading: () => set({ status: "loading", error: null }),
  setUser: (user) =>
    set({
      user,
      status: "ready",
      isBootstrapped: true,
      error: null,
    }),
  setError: (message) =>
    set({
      error: message,
      status: "error",
      isBootstrapped: true,
    }),
  clearAuth: () =>
    set({
      user: null,
      error: null,
      status: "ready",
      isBootstrapped: true,
    }),
}));
