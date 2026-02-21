"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";

interface AuthJWTContextProps {
  clearAuthState?: () => void;
  error?: string;
  errorStatusCode?: number;
  loading: boolean;
  token: string | null;
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

  const clearAuthState = useCallback(() => {
    setData(initialAuthState);
    hasInitialized.current = false;
  }, []);

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
          clearAuthState,
        });
        hasInitialized.current = true;
        return;
      }

      if (authData?.token) {
        setData({
          token: authData.token,
          loading: false,
          error: undefined,
          clearAuthState,
        });
        hasInitialized.current = true;
      }
    };

    getAuthToken();
  }, [clearAuthState]);

  return (
    <AuthJWTContext.Provider value={{ ...data, clearAuthState }}>
      {children}
    </AuthJWTContext.Provider>
  );
};
