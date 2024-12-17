export type Position = { x: number; y: number };

export interface HeaderProps {
  openAppearance: () => void;
}

export interface AppearanceProps {
  openAppearance: () => void;
  openUISettings: boolean;
}
