export const env = {
  backendUrl: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000",
  clerkPublishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY!,
};
