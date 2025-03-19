import { ComponentType } from "react";

export interface ContextProps {
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
}

//render modal component
export interface RenderModalComponentProps<T extends Record<string, any>> {
  isOpen: boolean;
  Component: ComponentType<T>;
  props: T;
}
