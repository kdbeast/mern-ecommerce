import { useAuth } from "@clerk/react";
import { Outlet, Navigate } from "react-router";
import { useAuthStore } from "@/features/auth/store";
import type { UserRole } from "@/lib/types";

type RoleGuardLayoutProps = {
  allow: UserRole[];
};

export const RoleGuardLayout = ({ allow }: RoleGuardLayoutProps) => {
  const { isSignedIn } = useAuth();
  const { isBootstrapped, user, status } = useAuthStore();

  if (!isBootstrapped || status === "loading") return null;

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
