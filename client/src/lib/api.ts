import { env } from "./env.js";
import type { ApiResponse } from "./types.js";
import axios, { type AxiosRequestConfig } from "axios";

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setApiTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

const api = axios.create({
  baseURL: env.backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
  if (!tokenGetter) return config;
  const token = await tokenGetter();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response.data.errors?.[0].message ||
      error.response.data.message ||
      "Something went wrong!"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong!";
};

export const apiGet = async <T>(url: string, config?: AxiosRequestConfig) => {
  try {
    const response = await api.get<ApiResponse<T>>(url, config);

    if (response.data.status === "error" || !response.data.data) {
      throw new Error(
        response.data.errors?.[0].message || "Something went wrong!",
      );
    }
    return response.data.data;
  } catch (error) {
    console.error("Error in API GET request:", error);
    throw new Error(getErrorMessage(error));
  }
};
