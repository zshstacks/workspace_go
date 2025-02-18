import { useCallback, useState } from "react";

export function useToggleStateOutside(initialState = false) {
  const [state, setState] = useState(initialState);

  const toggle = useCallback(() => {
    setState((prev) => !prev);
  }, []);

  return [state, setState, toggle] as const;
}
