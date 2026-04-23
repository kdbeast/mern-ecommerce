import { HomePage } from "./pages/customer/Home";
import { SignUpPage } from "./pages/auth/SignUp";
import { SignInPage } from "./pages/auth/SignIn";
import { createBrowserRouter } from "react-router";
import { CustomerLayout } from "./components/customer/CustomerLayout";
import { PublicOnlyLayout } from "./components/auth/PublicOnlyLayout";
import { ProtectedLayout } from "./components/auth/ProtectedLayout";
import { ProfilePage } from "./pages/customer/Profile";

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
]);
