import { env } from "./env.js";
import type { ApiEnvelope } from "./types.js";
import axios, { type AxiosRequestConfig } from "axios";

let tokenGetter: (() => Promise<string | null>) | null = null;

export const setApiTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

const api = axios.create({
  baseURL: env.backendUrl,
  withCredentials: true,
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
    const response = await api.get<ApiEnvelope<T>>(url, config);

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

export const apiPost = async <TResponse, TBody = unknown>(
  url: string,
  body?: TBody,
  config?: AxiosRequestConfig,
) => {
  try {
    const response = await api.post<ApiEnvelope<TResponse>>(url, body, config);

    if (response.data.status === "error" || !response.data.data) {
      throw new Error(
        response.data.errors?.[0].message || "Something went wrong!",
      );
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const apiPut = async <TResponse, TBody = unknown>(
  url: string,
  body: TBody,
  config?: AxiosRequestConfig,
) => {
  try {
    const response = await api.put<ApiEnvelope<TResponse>>(url, body, config);

    if (response.data.status === "error" || !response.data.data) {
      throw new Error(
        response.data.errors?.[0].message || "Something went wrong!",
      );
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const apiDelete = async <T>(
  url: string,
  config?: AxiosRequestConfig,
) => {
  try {
    const response = await api.delete<ApiEnvelope<T>>(url, config);

    if (response.data.status === "error" || !response.data.data) {
      throw new Error(
        response.data.errors?.[0].message || "Something went wrong!",
      );
    }
    return response.data.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
