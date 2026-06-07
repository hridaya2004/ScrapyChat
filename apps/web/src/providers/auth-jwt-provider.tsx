"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authClient, type User } from "@/lib/auth-client";

interface AuthJWTContextProps {
  clearAuthState?: () => void;
  error?: string;
  errorStatusCode?: number;
  loading: boolean;
  token: string | null;
  user: User | null;
}

const initialAuthState: AuthJWTContextProps = {
  token: null,
  user: null,
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
  const {
    data: sessionData,
    isPending: sessionLoading,
    error: sessionError,
  } = authClient.useSession();

  const [token, setToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string>();
  const [tokenErrorStatus, setTokenErrorStatus] = useState<number>();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchToken = useCallback(async () => {
    setTokenLoading(true);
    const { data, error } = await authClient.token();
    if (!mountedRef.current) {
      return;
    }
    setTokenLoading(false);
    if (error) {
      setToken("");
      setTokenError(error.message);
      setTokenErrorStatus(error.status);
    } else if (data?.token) {
      setToken(data.token);
      setTokenError(undefined);
      setTokenErrorStatus(undefined);
    }
  }, []);

  useEffect(() => {
    if (sessionData?.session) {
      fetchToken();
    } else if (!sessionLoading) {
      setToken(null);
      setTokenLoading(false);
      setTokenError(undefined);
      setTokenErrorStatus(undefined);
    }
  }, [sessionData, sessionLoading, fetchToken]);

  const clearAuthState = useCallback(() => {
    if (sessionData?.session) {
      fetchToken();
    }
  }, [sessionData, fetchToken]);

  return (
    <AuthJWTContext.Provider
      value={{
        token,
        user: sessionData?.user ?? null,
        loading: sessionLoading || tokenLoading,
        error: tokenError || sessionError?.message,
        errorStatusCode: tokenErrorStatus,
        clearAuthState,
      }}
    >
      {children}
    </AuthJWTContext.Provider>
  );
};
