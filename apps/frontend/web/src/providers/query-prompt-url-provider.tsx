"use client";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type QueryPromptUrlContextValue = {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
};

const QueryPromptUrlContext = createContext<QueryPromptUrlContextValue | null>(
  null
);

export function useQueryPromptUrlProvider() {
  const context = useContext(QueryPromptUrlContext);

  if (!context) {
    throw new Error(
      "useQueryPromptUrlProvider must be used within QueryPromptUrlProvider"
    );
  }

  return context;
}

type QueryPromptUrlProviderProps = {
  children: ReactNode;
  initialQuery?: string;
};

export function QueryPromptUrlProvider({
  children,
  initialQuery = "",
}: QueryPromptUrlProviderProps) {
  const [query, setQuery] = useState(initialQuery);

  const clearQuery = () => setQuery("");

  useEffect(() => {
    console.log("Query updated:", query);
  }, [query]);

  return (
    <QueryPromptUrlContext.Provider value={{ query, setQuery, clearQuery }}>
      {children}
    </QueryPromptUrlContext.Provider>
  );
}
