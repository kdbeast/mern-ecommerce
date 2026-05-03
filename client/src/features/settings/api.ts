import { apiGet, apiPost } from "@/lib/api";
import type { AdminBannersResponse } from "./types";

export const getAdminBanners = () =>
  apiGet<AdminBannersResponse>("/admin/settings/banners");

export const uploadAdminBanners = (formData: FormData) =>
  apiPost<AdminBannersResponse, FormData>("/admin/settings/banners", formData);
