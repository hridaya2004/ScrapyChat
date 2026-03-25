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
  isHapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  trigger: (type?: HapticType) => void;
}

const HapticsContext = createContext<HapticsContextValue | null>(null);

const ENABLE_HAPTICS_KEY = "haptics-enabled";

export function HapticsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { getItem: getHapticsEnabledValue, setItem: setHapticsEnabledValue } =
    useLocalStorage(ENABLE_HAPTICS_KEY);

  // local state
  const [isHapticsEnabled, setHapticsEnabledState] = useState(
    () => getHapticsEnabledValue() ?? false
  );

  const haptic = useWebHaptics();

  const setHapticsEnabled = useCallback(
    (value: boolean) => {
      setHapticsEnabledState(value);
      setHapticsEnabledValue(value);
    },
    [setHapticsEnabledValue]
  );

  const trigger = useCallback(
    (type?: HapticType) => {
      if (!isHapticsEnabled) {
        return;
      }
      if (haptic.isSupported) {
        haptic.trigger(type);
      }
    },
    [isHapticsEnabled, haptic]
  );

  const value = useMemo(
    () => ({ isHapticsEnabled, setHapticsEnabled, trigger }),
    [isHapticsEnabled, setHapticsEnabled, trigger]
  );

  return (
    <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>
  );
}

const noopHaptics: HapticsContextValue = {
  isHapticsEnabled: false,
  setHapticsEnabled: () => {
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
