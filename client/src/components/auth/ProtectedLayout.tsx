import { useAuth } from "@clerk/react";
import { useAuthStore } from "@/features/auth/store";
import { useLocation, Navigate, Outlet } from "react-router";

export const ProtectedLayout = () => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { isBootstrapped, status } = useAuthStore();

  if (!isLoaded || (isSignedIn && (!isBootstrapped || status === "loading")))
    return null;

  if (!isSignedIn) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
};
