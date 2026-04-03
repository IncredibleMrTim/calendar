import { useRef, useCallback } from "react";

interface UseClickHandlerOptions<T> {
  mode: "single" | "double";
  onClick: (data: T) => void;
  threshold?: number;
  isEqual?: (a: T, b: T) => boolean;
}

export function useClickHandler<T>({
  mode,
  onClick,
  threshold = 300,
  isEqual,
}: UseClickHandlerOptions<T>) {
  const lastClickRef = useRef<{ time: number; data: T | null }>({
    time: 0,
    data: null,
  });

  const handleClick = useCallback(
    (data: T) => {
      if (mode === "single") {
        onClick(data);
        return;
      }

      const now = Date.now();
      const timeSinceLastClick = now - lastClickRef.current.time;

      const isSameData = isEqual
        ? lastClickRef.current.data !== null &&
          isEqual(lastClickRef.current.data, data)
        : lastClickRef.current.data === data;

      if (timeSinceLastClick < threshold && isSameData) {
        onClick(data);
        lastClickRef.current = { time: 0, data: null };
      } else {
        lastClickRef.current = { time: now, data };
      }
    },
    [mode, onClick, threshold, isEqual]
  );

  return handleClick;
}
