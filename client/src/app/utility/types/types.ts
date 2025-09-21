import { ComponentType } from "react";

export interface ContextProps {
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  videoId: string;
  setVideoId: React.Dispatch<React.SetStateAction<string>>;
}

type ReactComponent<P = Record<string, unknown>> = ComponentType<P>;
//render modal component
export interface RenderModalComponentProps<T extends Record<string, unknown>> {
  isOpen: boolean;
  Component: ReactComponent<T>;
  props: T;
}
