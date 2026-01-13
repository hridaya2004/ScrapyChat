"use client";

import { createContext, useContext, useState } from "react";

type DialogStateMap = Record<string, boolean>;

interface DialogContextValue {
  dialogs: DialogStateMap;
  setDialogState: (id: string, isOpen: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = (id: string) => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("useDialog must be used within DialogProvider");
  }

  const { dialogs, setDialogState } = context;

  return {
    dialogState: dialogs[id] ?? false,
    setDialogState: (isOpen: boolean) => setDialogState(id, isOpen),
  };
};

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogStateMap>({});

  const setDialogState = (id: string, isOpen: boolean) => {
    setDialogs((prev) => ({
      ...prev,
      [id]: isOpen,
    }));
  };

  return (
    <DialogContext.Provider value={{ dialogs, setDialogState }}>
      {children}
    </DialogContext.Provider>
  );
};
