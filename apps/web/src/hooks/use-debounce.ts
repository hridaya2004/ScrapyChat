import { useCallback, useRef, useState } from "react";

/**
 * Returns a debounced version of a callback that ignores subsequent calls
 * within the specified delay after the last invocation.
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 2000
) {
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      setIsPending(true);
      callback(...args);

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        setIsPending(false);
      }, delay);
    },
    [callback, delay]
  );

  return [debouncedFn, isPending] as const;
}
