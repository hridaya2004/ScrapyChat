"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthJWTContextProps {
  token: string | null;
  loading: boolean;
  error?: string;
  errorStatusCode?: number;
}

const initialAuthState: AuthJWTContextProps = {
  token: null,
  loading: true,
  error: undefined,
};

const AuthJWTContext = createContext<AuthJWTContextProps>(initialAuthState);

export const useAuthJWTProvider = () => useContext(AuthJWTContext);

export const AuthJWTProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<AuthJWTContextProps>(initialAuthState);

  useEffect(() => {
    const getAuthToken = async () => {
      const { data: authData, error: authError } = await authClient.token();

      if (authError) {
        setData({
          token: "",
          loading: false,
          error: authError.message,
          errorStatusCode: authError.status,
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

    if (!data.token) {
      getAuthToken();
    }

    return () => {
      //noop
    };
  }, [data.token]);

  return (
    <AuthJWTContext.Provider value={data}>{children}</AuthJWTContext.Provider>
  );
};
