import { useEffect } from "react";
import { useAuthStore } from "./store";
import { useAuth } from "@clerk/react";
import { getMe, syncUser } from "./api";
import { setApiTokenGetter } from "@/lib/api";

export const useBootstrapAuth = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { setUser, setError, setLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    setApiTokenGetter(async () => {
      const token = await getToken();
      return token ?? null;
    });
  }, [getToken]);

  useEffect(() => {
    const run = async () => {
      if (!isLoaded) return;

      //user not signed in
      if (!isSignedIn) {
        clearAuth();
        return;
      }

      try {
        setLoading();

        await syncUser();
        const me = await getMe();

        setUser(me?.user);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to sync user";
        setError(message);
      }
    };
    void run();
  }, [isLoaded, isSignedIn, setUser, setError, setLoading, clearAuth]);
};
