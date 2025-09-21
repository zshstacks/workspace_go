import { useEffect } from "react";

type SerializableValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | SerializableValue[]
  | { [key: string]: SerializableValue };

export const useDebounceLocalStorage = (
  key: string,
  value: SerializableValue,
  delay = 1000
) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          const stringValue =
            typeof value === "string" ? value : JSON.stringify(value);
          localStorage.setItem(key, stringValue);
        }
      } catch (error) {
        console.warn(`localStorage save failed for ${key}:`, error);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, value, delay]);
};
