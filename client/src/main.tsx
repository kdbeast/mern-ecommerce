import "./index.css";
import App from "./App.tsx";
import { env } from "./lib/env.js";
import { ClerkProvider } from "@clerk/react";
import { createRoot } from "react-dom/client";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={env.clerkPublishableKey}>
    <Toaster richColors position="top-center" />
    <App />
  </ClerkProvider>,
);
