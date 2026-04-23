import { router } from "./router";
import { RouterProvider } from "react-router";
import { useBootstrapAuth } from "./features/auth/useBootstrapAuth";

const App = () => {
  useBootstrapAuth();
  return <RouterProvider router={router} />;
};

export default App;
