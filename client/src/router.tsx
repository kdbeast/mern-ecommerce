import { HomePage } from "./pages/customer/Home";
import { SignUpPage } from "./pages/auth/SignUp";
import { SignInPage } from "./pages/auth/SignIn";
import Collections from "./pages/customer/Collections";
import CollectionDetails from "./pages/customer/Collection-Details";

import OrdersPage from "./pages/admin/Orders";
import AdminPromos from "./pages/admin/Promos";
import ProductsPage from "./pages/admin/Products";
import SettingsPage from "./pages/admin/Settings";
import DashboardPage from "./pages/admin/Dashboard";

import { ProfilePage } from "./pages/customer/Profile";
import { AdminLayout } from "./components/layout/AdminLayout";

import { CustomerLayout } from "./components/layout/CustomerLayout";

import { ProtectedLayout } from "./components/auth/ProtectedLayout";
import { RoleGuardLayout } from "./components/auth/RoleGuardLayout";
import { PublicOnlyLayout } from "./components/auth/PublicOnlyLayout";

import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        element: <PublicOnlyLayout />,
        children: [
          {
            path: "sign-in/*",
            element: <SignInPage />,
          },
          {
            path: "sign-up/*",
            element: <SignUpPage />,
          },
          {
            path: "collections",
            element: <Collections />,
          },
          {
            path: "collection/:id",
            element: <CollectionDetails />,
          },
        ],
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <RoleGuardLayout allow={["ADMIN"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              {
                index: true,
                element: <DashboardPage />,
              },
              {
                path: "products",
                element: <ProductsPage />,
              },
              {
                path: "coupons",
                element: <AdminPromos />,
              },
              {
                path: "orders",
                element: <OrdersPage />,
              },
              {
                path: "settings",
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
