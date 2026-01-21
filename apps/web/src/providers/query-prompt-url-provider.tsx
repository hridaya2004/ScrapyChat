"use client";
import { createContext, type ReactNode, useContext, useState } from "react";

interface QueryPromptUrlContextProps {
  url: string;
  setUrl: (url: string) => void;
  clearUrl: () => void;
  superUrl: boolean;
  setSuperUrl: (superUrl: boolean) => void;
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
  const [superUrl, setSuperUrl] = useState(false);

  const clearUrl = () => {
    setUrl("");
    setSuperUrl(false);
  };

  return (
    <QueryPromptUrlContext.Provider
      value={{ url, setUrl, clearUrl, superUrl, setSuperUrl }}
    >
      {children}
    </QueryPromptUrlContext.Provider>
  );
}
