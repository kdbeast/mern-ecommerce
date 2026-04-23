import "./index.css";
import App from "./App.tsx";
import { env } from "./lib/env.js";
import { ClerkProvider } from "@clerk/react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={env.clerkPublishableKey}>
    <App />
  </ClerkProvider>,
);
