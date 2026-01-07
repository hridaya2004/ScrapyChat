"use client";
import { createContext, type ReactNode, useContext, useState } from "react";

interface QueryPromptUrlContextProps {
  url: string;
  setUrl: (url: string) => void;
  clearUrl: () => void;
}

const QueryPromptUrlContext = createContext<
  QueryPromptUrlContextProps | undefined
>(undefined);

export const useQueryPromptUrlProvider = () => {
  const context = useContext(QueryPromptUrlContext);
  if (!context) {
    throw new Error(
      "useQueryPromptUrlProvider must be used within QueryPromptUrlProvider"
    );
  }
  return context;
};

export function QueryPromptUrlProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState("");

  const clearUrl = () => setUrl("");

  return (
    <QueryPromptUrlContext.Provider value={{ url, setUrl, clearUrl }}>
      {children}
    </QueryPromptUrlContext.Provider>
  );
}
