export type Position = { x: number; y: number };

export interface HeaderProps {
  setOpenUISettings: () => void;
  setOpenAccSettings: () => void;
  setIsTimerActive: () => void;
  isTimerActive: boolean;
}

export interface AppearanceProps {
  setOpenUISettings: () => void;
  openUISettings: boolean;
}

export interface UserAccountProps {
  setOpenAccSettings: () => void;
  openAccSettings: boolean;
}

export interface UserMenuProps {
  setOpenUISettings: () => void;
  setOpenAccSettings: () => void;
}

export interface PomoTimerProps {
  openSettings: boolean;
  setOpenSettings: () => void;
  position: Position;
}
