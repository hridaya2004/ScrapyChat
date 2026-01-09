"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface ModelConfig {
  providerId: string;
  modelName: string;
  apiKey: string;
}

interface ModelProviderContextProps {
  models: Record<string, ModelConfig>;
  selectedModel: string;
  refreshModels: () => void;
  refreshSelectedModel: () => void;
}

const initialModelContextState: ModelProviderContextProps = {
  models: {},
  selectedModel: "",
  refreshModels: () => {
    //noop
  },
  refreshSelectedModel: () => {
    //noop
  },
};

const ModelContext = createContext<ModelProviderContextProps>(
  initialModelContextState
);

export const useModel = () => useContext(ModelContext);

export function ModelContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getItem: getModels } = useLocalStorage("models");
  const { getItem: getSelectedModel } = useLocalStorage("selected-model");

  const [models, setModels] = useState<Record<string, ModelConfig>>(
    () => getModels() ?? {}
  );

  const [selectedModel, setSelectedModel] = useState<string>(
    () => getSelectedModel() ?? "google-selfhost"
  );

  const refreshSelectedModel = useCallback(() => {
    const latest = getSelectedModel();
    setSelectedModel(latest ?? {});
  }, [getSelectedModel]);

  const refreshModels = useCallback(() => {
    const latest = getModels();
    setModels(latest ?? {});
  }, [getModels]);

  return (
    <ModelContext.Provider
      value={{ models, refreshModels, selectedModel, refreshSelectedModel }}
    >
      {children}
    </ModelContext.Provider>
  );
}
