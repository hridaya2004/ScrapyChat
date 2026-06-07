"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { authClient, type User } from "@/lib/auth-client";

interface AuthContextProps {
  clearAuthState?: () => void;
  error?: string;
  errorStatusCode?: number;
  loading: boolean;
  token: string | null;
  user: User | null;
}

const initialAuthState: AuthContextProps = {
  token: null,
  user: null,
  loading: true,
  error: undefined,
};

const AuthContext = createContext<AuthContextProps>(initialAuthState);

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();

  const {
    data: sessionData,
    isPending: sessionLoading,
    error: sessionError,
  } = authClient.useSession();

  const hasSession = !!sessionData?.session;

  const {
    data: token,
    isPending: tokenLoading,
    error: tokenError,
  } = useQuery({
    queryKey: ["auth-token", sessionData?.session?.id],
    queryFn: async () => {
      const { data, error } = await authClient.token();
      if (error) {
        throw error;
      }
      return data?.token ?? null;
    },
    enabled: hasSession,
  });

  const clearAuthState = () => {
    if (hasSession) {
      queryClient.invalidateQueries({
        queryKey: ["auth-token", sessionData.session.id],
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token: hasSession ? (token ?? null) : null,
        user: sessionData?.user ?? null,
        loading: sessionLoading || (hasSession ? tokenLoading : false),
        error: tokenError?.message || sessionError?.message,
        errorStatusCode: (tokenError as { status?: number })?.status,
        clearAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
