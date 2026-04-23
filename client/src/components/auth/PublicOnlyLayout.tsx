import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/features/auth/store";

export const PublicOnlyLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status } = useAuthStore();

  if (!isLoaded) return null;

  if (isSignedIn && (!isBootstrapped || status === "loading")) {
    return null;
  }

  if (isSignedIn) {
    return <Navigate to={"profile"} replace={true} />;
  }

  return <Outlet />;
};
