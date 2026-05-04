import { useAuth } from "@clerk/react";
import { CommonLoader } from "../common/Loader";
import { useAuthStore } from "@/features/auth/store";
import { Navigate, Outlet, useLocation } from "react-router";

export const PublicOnlyLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const { isBootstrapped, status } = useAuthStore();

  if (!isLoaded) return null;

  if (isSignedIn && (!isBootstrapped || status === "loading")) {
    return <CommonLoader />;
  }

  if (
    isSignedIn &&
    (location.pathname === "/sign-in" || location.pathname === "/sign-up")
  ) {
    return <Navigate to={"/"} replace={true} />;
  }

  return <Outlet />;
};
