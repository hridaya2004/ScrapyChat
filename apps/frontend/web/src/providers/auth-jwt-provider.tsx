"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthJWTContextProps = {
  token: string;
  loading: boolean;
  error?: string;
};

const AuthJWTContext = createContext<AuthJWTContextProps>({
  token: "",
  loading: true,
  error: undefined,
});

const initialAuthState = {
  token: "",
  loading: true,
  error: undefined,
};

export const useAuthJWTProvider = () => useContext(AuthJWTContext);

export function AuthJWTProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AuthJWTContextProps>(initialAuthState);

  useEffect(() => {
    const getAuthToken = async () => {
      const { data: authData, error: authError } = await authClient.token();

      if (authError) {
        setData({
          token: "",
          loading: false,
          error: authError.message,
        });
      }

      if (authData?.token) {
        setData({
          token: authData.token,
          loading: false,
          error: undefined,
        });
      }
    };

    if (!data.token.trim()) {
      getAuthToken();
    }

    return () => {
      //noop
    };
  }, [data.token]);

  return (
    <AuthJWTContext.Provider value={data}>{children}</AuthJWTContext.Provider>
  );
}
