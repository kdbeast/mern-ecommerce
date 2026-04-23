import { apiPost } from "@/lib/api";
import type { MeResponse, SyncResponse } from "./types";

export const syncUser = async () => {
  return apiPost<SyncResponse>("/auth/sync");
};

export const getMe = async () => {
  return apiPost<MeResponse>("/auth/me");
};
