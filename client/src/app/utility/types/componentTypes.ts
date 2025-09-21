import { AppDispatch } from "@/app/redux/store";

export interface HeaderProps {
  setOpenUISettings: () => void;
  setOpenAccSettings: () => void;
  setIsTimerActive: () => void;
  setIsTodoActive: () => void;
  setIsMediaActive: () => void;
  setIsPaintActive: () => void;
  setIsCalculatorActive: () => void;
  setOpenUserStats: () => void;
  setOpenBackgroundSelect: () => void;
  setOpacity: (value: number) => void;
  opacity: number;
  isTimerActive: boolean;
  isCalculatorActive: boolean;
  isMediaActive: boolean;
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

export interface BackgroundSelectProps {
  setOpenBackgroundSelect: () => void;
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
  PaintWidget?: WidgetInfo;
  MediaWidget?: WidgetInfo;
  CalculatorWidget?: WidgetInfo;
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

export interface PomoTimerProps {
  openSettings: boolean;
  setOpenSettings: () => void;
  setIsTimerActive: () => void;
  widgetInfo?: WidgetInfo;
  activeWidget: string;
  setActiveWidget: (
    value: "pomodoro" | "todo" | "paint" | "media" | "calculator"
  ) => void;
  opacity: number;
}

export interface TodoProps {
  setIsTodoActive: () => void;
  widgetInfo?: WidgetInfo;
  dimensions: { width: number; height: number };
  setDimensions: (dimensions: { width: number; height: number }) => void;
  activeWidget: string;
  setActiveWidget: (
    value: "pomodoro" | "todo" | "paint" | "media" | "calculator"
  ) => void;
  opacity: number;
}

export interface PaintProps {
  setIsPaintActive: () => void;
  dimensionsPaint: { width: number; height: number };
  setDimensionsPaint: (dimensions: { width: number; height: number }) => void;
  widgetInfo?: WidgetInfo;
  activeWidget: string;
  setActiveWidget: (
    value: "pomodoro" | "todo" | "paint" | "media" | "calculator"
  ) => void;
  opacity: number;
}

export interface MediaProps {
  setIsMediaActive: () => void;
  dimensionsMedia: { width: number; height: number };
  setDimensionsMedia: (dimensions: { width: number; height: number }) => void;
  widgetInfo?: WidgetInfo;
  activeWidget: string;
  setActiveWidget: (
    value: "pomodoro" | "todo" | "paint" | "media" | "calculator"
  ) => void;
  opacity: number;
}

export interface CalculatorProps {
  setIsCalculatorActive: () => void;
  widgetInfo?: WidgetInfo;
  activeWidget: string;
  setActiveWidget: (
    value: "pomodoro" | "todo" | "paint" | "media" | "calculator"
  ) => void;
  opacity: number;
}

export interface EmailModalProps {
  email: string;
}

// Task objekta tips
export interface Task {
  LocalID: number;
  Title: string;
  Description: string;
  Completed: boolean;
  Order: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

// Sortable Task Item Component
export interface SortableTaskItemProps {
  task: Task;
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

//fabric.js paint
export interface FabricProps {
  width: number;
  height: number;
}

export interface MediaContentProps {
  youtubeUrl: string;
}
