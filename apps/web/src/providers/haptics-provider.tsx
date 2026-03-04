"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useWebHaptics } from "web-haptics/react";
import { useLocalStorage } from "@/hooks/use-local-storage";

type HapticType =
  | "success"
  | "warning"
  | "error"
  | "light"
  | "medium"
  | "heavy"
  | "selection";

interface HapticsContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  trigger: (type?: HapticType) => void;
}

const HapticsContext = createContext<HapticsContextValue | null>(null);

const STORAGE_KEY = "haptics-enabled";

export function HapticsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { getItem, setItem } = useLocalStorage(STORAGE_KEY);
  const [enabled, setEnabledState] = useState(() => getItem() ?? true);
  const haptic = useWebHaptics();

  const setEnabled = useCallback(
    (value: boolean) => {
      setEnabledState(value);
      setItem(value);
    },
    [setItem]
  );

  const trigger = useCallback(
    (type?: HapticType) => {
      if (!enabled) {
        return;
      }
      if (haptic.isSupported) {
        haptic.trigger(type);
      }
    },
    [enabled, haptic]
  );

  const value = useMemo(
    () => ({ enabled, setEnabled, trigger }),
    [enabled, setEnabled, trigger]
  );

  return (
    <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>
  );
}

const noopHaptics: HapticsContextValue = {
  enabled: false,
  setEnabled: () => {
    //noop
  },
  trigger: () => {
    //noop
  },
};

export function useHaptics() {
  const context = useContext(HapticsContext);
  if (!context) {
    return noopHaptics;
  }
  return context;
}
