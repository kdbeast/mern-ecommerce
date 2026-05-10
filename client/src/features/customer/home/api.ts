import { apiGet } from "@/lib/api";
import type { CustomerHomeResponse } from "./types";

export const getCustomerHomeDateOverview = () => {
  return apiGet<CustomerHomeResponse>("/customer/home");
}
