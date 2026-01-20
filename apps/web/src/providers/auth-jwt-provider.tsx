"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
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
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    const getAuthToken = async () => {
      const { data: authData, error: authError } = await authClient.token();

      if (authError) {
        setData({
          token: "",
          loading: false,
          error: authError.message,
          errorStatusCode: authError.status,
        });
        hasInitialized.current = true;
        return;
      }

      if (authData?.token) {
        setData({
          token: authData.token,
          loading: false,
          error: undefined,
        });
        hasInitialized.current = true;
      }
    };

    getAuthToken();
  }, []);

  return (
    <AuthJWTContext.Provider value={data}>{children}</AuthJWTContext.Provider>
  );
};
