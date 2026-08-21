"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { WebHaptics } from "web-haptics";
import { useWebHaptics } from "web-haptics/react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export type HapticType =
  | "success"
  | "warning"
  | "error"
  | "light"
  | "medium"
  | "heavy"
  | "selection";

interface HapticsContextValue {
  isHapticsEnabled: boolean;
  isSoundEnabled: boolean;

  setHapticsEnabled: (isHapticsEnabled: boolean) => void;
  setSoundEnabled: (isSoundEnabled: boolean) => void;

  trigger: (type?: HapticType) => void;
}

const HapticsContext = createContext<HapticsContextValue | null>(null);

const ENABLE_HAPTICS_KEY = "haptics-enabled";
const ENABLE_SOUND_KEY = "sound-enabled";

export function HapticsProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  const { getItem: getHapticsEnabledValue, setItem: setHapticsEnabledValue } =
    useLocalStorage(ENABLE_HAPTICS_KEY);
  const { getItem: getSoundEnabledValue, setItem: setSoundEnabledValue } =
    useLocalStorage(ENABLE_SOUND_KEY);

  // local state
  const [isHapticsEnabled, setHapticsEnabledState] = useState(
    () => getHapticsEnabledValue() ?? false
  );
  const [isSoundEnabled, setSoundEnabledState] = useState(
    () => getSoundEnabledValue() ?? false
  );

  const stateRef = useRef({ isHapticsEnabled, isSoundEnabled });
  stateRef.current = { isHapticsEnabled, isSoundEnabled };

  const haptic = useWebHaptics({ debug: isSoundEnabled });

  const setHapticsEnabled = useCallback(
    (enabled: boolean) => {
      setHapticsEnabledState(enabled);
      setHapticsEnabledValue(enabled);
    },
    [setHapticsEnabledValue]
  );

  const setSoundEnabled = useCallback(
    (enabled: boolean) => {
      setSoundEnabledState(enabled);
      setSoundEnabledValue(enabled);
    },
    [setSoundEnabledValue]
  );

  const trigger = useCallback(
    (type?: HapticType) => {
      const { isHapticsEnabled: hapticsEnabled, isSoundEnabled: soundEnabled } =
        stateRef.current;

      if ((hapticsEnabled && WebHaptics.isSupported) || soundEnabled) {
        haptic.trigger(type);
      }
    },
    [haptic]
  );

  const value = useMemo(
    () => ({
      isHapticsEnabled,
      isSoundEnabled,
      setHapticsEnabled,
      setSoundEnabled,
      trigger,
    }),
    [
      isHapticsEnabled,
      setHapticsEnabled,
      isSoundEnabled,
      setSoundEnabled,
      trigger,
    ]
  );

  return (
    <HapticsContext.Provider value={value}>{children}</HapticsContext.Provider>
  );
}

const noopHaptics: HapticsContextValue = {
  isHapticsEnabled: false,
  isSoundEnabled: false,

  setHapticsEnabled: () => {
    // noop
  },

  setSoundEnabled: () => {
    // noop
  },

  trigger: () => {
    // noop
  },
};

export function useHaptics() {
  const context = useContext(HapticsContext);

  return context ?? noopHaptics;
}
