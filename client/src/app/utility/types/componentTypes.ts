import { AppDispatch } from "@/app/redux/store";

export interface HeaderProps {
  setOpenUISettings: () => void;
  setOpenAccSettings: () => void;
  setIsTimerActive: () => void;
  setIsTodoActive: () => void;
  setIsPaintActive: () => void;
  setOpenUserStats: () => void;
  isTimerActive: boolean;
  isPaintActive: boolean;
  isTodoActive: boolean;
  hideElementsActive: boolean;
  hideAfterSeconds: number;
}

export interface AppearanceProps {
  setOpenUISettings: (a: boolean) => void;
  openUISettings: boolean;
  setHideElementsActive: (a: boolean) => void;
  setHideAfterSeconds: (a: number) => void;
}

export interface UserAccountProps {
  setOpenAccSettings: () => void;
  openAccSettings: boolean;
}

export interface UserMenuProps {
  setOpenUISettings: () => void;
  setOpenAccSettings: () => void;
}

export interface WidgetInfo {
  xPos: number;
  yPos: number;
}

export interface SavedWidgetLayoutInfo {
  TimerWidget?: WidgetInfo;
  TodoWidget?: WidgetInfo;
}

export interface PomoTimerProps {
  openSettings: boolean;
  setOpenSettings: () => void;
  setIsTimerActive: () => void;
  widgetInfo?: WidgetInfo;
  activeWidget: string;
  setActiveWidget: (value: "pomodoro" | "todo") => void;
}

export interface PomoTimerSettingsProps {
  setIsHideCount: () => void;
  ishideCount: boolean;

  setTimerSound: (newSound: string) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export interface PomoTimerPhasesProps {
  setOpenSettings: () => void;
}

export interface TodoProps {
  setIsTodoActive: () => void;
  widgetInfo?: WidgetInfo;
  dimensions: { width: number; height: number };
  setDimensions: (dimensions: { width: number; height: number }) => void;
  activeWidget: string;
  setActiveWidget: (value: "pomodoro" | "todo") => void;
}

export interface EmailModalProps {
  email: string;
}

// Sortable Task Item Component
export interface SortableTaskItemProps {
  task: any;
  handleCompleteTask: (taskId: number, isCompleted: boolean) => void;
  handleDeleteTask: (taskId: number) => void;
  autoResizeTextarea: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  CHARACTER_LIMIT: number;
  dispatch: AppDispatch;
  isDragging?: boolean;
}

// user stats props
export interface UserStatsProps {
  setOpenUserStats: (a: boolean) => void;
  openUserStats: boolean;
}
