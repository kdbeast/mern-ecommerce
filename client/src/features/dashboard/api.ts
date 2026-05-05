import { apiGet } from "@/lib/api";
import type { AdminDashboardLite } from "./types";

export const getAdminDashboardLite = () => {
  return apiGet<AdminDashboardLite>("/admin/dashboard/lite");
}
