import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router";
import { CommonLoader } from "../common/Loader";
import { useAuthStore } from "@/features/auth/store";

export const PublicOnlyLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status } = useAuthStore();

  if (!isLoaded) return null;

  if (isSignedIn && (!isBootstrapped || status === "loading")) {
    return <CommonLoader />;
  }

  if (isSignedIn) {
    return <Navigate to={"profile"} replace={true} />;
  }

  return <Outlet />;
};
