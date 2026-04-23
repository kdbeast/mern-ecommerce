export type UserRole = "USER" | "ADMIN";

export type User = {
  _id: string;
  clerkUserId: string;
  name: string;
  email: string;
  role: UserRole;
};

export type ApiErrorItem = {
  message: string;
  code?: string;
};

export type ApiResponse<T> = {
  status: "success" | "error";
  data: T | null;
  meta?: Record<string, unknown>;
  errors?: ApiErrorItem[];
};
