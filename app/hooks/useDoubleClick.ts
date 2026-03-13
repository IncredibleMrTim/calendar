import { useRef, useCallback } from "react";

interface UseDoubleClickOptions<T> {
  onDoubleClick: (data: T) => void;
  threshold?: number;
  isEqual?: (a: T, b: T) => boolean;
}

/**
 * Custom hook for detecting double-clicks
 * @param onDoubleClick - Callback to execute on double-click
 * @param threshold - Time window for double-click detection in ms (default: 300)
 * @param isEqual - Optional custom equality checker for data comparison
 * @returns Click handler function
 */
export function useDoubleClick<T>({
  onDoubleClick,
  threshold = 300,
  isEqual,
}: UseDoubleClickOptions<T>) {
  const lastClickRef = useRef<{ time: number; data: T | null }>({
    time: 0,
    data: null,
  });

  const handleClick = useCallback(
    (data: T) => {
      const now = Date.now();
      const timeSinceLastClick = now - lastClickRef.current.time;

      // Check if it's a double-click
      const isSameData = isEqual
        ? lastClickRef.current.data !== null &&
          isEqual(lastClickRef.current.data, data)
        : lastClickRef.current.data === data;

      if (timeSinceLastClick < threshold && isSameData) {
        // Double-click detected
        onDoubleClick(data);
        lastClickRef.current = { time: 0, data: null }; // Reset
      } else {
        // Single click - just track it
        lastClickRef.current = { time: now, data };
      }
    },
    [onDoubleClick, threshold, isEqual]
  );

  return handleClick;
}
