import { ApiError } from "./ApiError.js";

export function requireText(value: unknown, message: string, statusCode = 400) {
  if (!String(value || "").trim()) {
    throw new ApiError(statusCode, message);
  }
}

export function requireNumber(
  value: unknown,
  message: string,
  statusCode = 400,
) {
  if (Number.isNaN(value)) {
    throw new ApiError(statusCode, message);
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  message: string,
  statusCode = 404,
): T {
  if (!value) {
    throw new ApiError(statusCode, message);
  }

  return value;
}
