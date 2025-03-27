"use client";

import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useState,
} from "react";

import Header from "../../Header/Header";

import { DndContext } from "@dnd-kit/core";
import {
  SavedWidgetLayoutInfo,
  WidgetInfo,
} from "@/app/utility/types/componentTypes";
import { useToggleState } from "@/app/hooks/useToggleState";
import { restrictToBoundingBox } from "@/app/hooks/boundingBoxRes";
import { restrictToTodoBoundingBox } from "@/app/hooks/restrictToTodoBoundingBox";
import RenderModalComponent from "@/app/hooks/Modal/RenderModalComponent";

const localStorageKey = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY as string;

const UserStats = lazy(() => import("../../Header/UserStats/UserStats"));
const Task = lazy(
  () => import("@/app/components/Workspace/WorkspaceContent/Task/Task")
);
const UserAccount = lazy(
  () => import("../../Header/UserMenu/UserAccount/UserAccount")
);
const Appearance = lazy(
  () => import("../../Header/UserMenu/Appearance/Appearance")
);
const PomoTimer = lazy(() => import("./PomoTimer/PomoTimer"));

const WorkspaceContent = () => {
  const [openUISettings, setOpenUISettings] = useToggleState(false);
  const [openAccSettings, setOpenAccSettings] = useToggleState(false);
  const [openSettings, setOpenSettings] = useToggleState(false);
  const [isTimerActive, setIsTimerActive] = useToggleState(true);
  const [isTodoActive, setIsTodoActive] = useToggleState(false);
  const [openUserStats, setOpenUserStats] = useToggleState(false);

  const [hideElementsActive, setHideElementsActive] = useState(false);
  const [hideAfterSeconds, setHideAfterSeconds] = useState<number>(30);
  const [dimensions, setDimensions] = useState({ width: 490, height: 478 });
  const [activeWidget, setActiveWidget] = useState<"todo" | "pomodoro">(
    "pomodoro"
  );
  const [isClient, setIsClient] = useState(false);
  const [widgetLayout, setWidgetLayout] = useState<SavedWidgetLayoutInfo>({});

  const dndId = useId(); //generate unique id

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const savedPosition = localStorage.getItem(localStorageKey);
    if (savedPosition) setWidgetLayout(JSON.parse(savedPosition));
  }, []);

  const updateWidgetLayout = useCallback(
    (widgetKey: keyof SavedWidgetLayoutInfo, newInfo: WidgetInfo) => {
      const updatedLayout: SavedWidgetLayoutInfo = {
        ...widgetLayout,
        [widgetKey]: newInfo,
      };
      setWidgetLayout(updatedLayout);
      const debounceSave = setTimeout(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(updatedLayout));
      }, 500);
      return () => clearTimeout(debounceSave);
    },
    [widgetLayout]
  );

  const handleTimerDragEnd = useCallback(
    (delta: { x: number; y: number }) => {
      const currentTimer = widgetLayout.TimerWidget || { xPos: 0, yPos: 0 };
      const newTimerInfo = {
        ...currentTimer,
        xPos: currentTimer.xPos + delta.x,
        yPos: currentTimer.yPos + delta.y,
      };
      updateWidgetLayout("TimerWidget", newTimerInfo);
    },
    [widgetLayout.TimerWidget, updateWidgetLayout]
  );

  const handleTodoDragEnd = useCallback(
    (delta: { x: number; y: number }) => {
      const currentTimer = widgetLayout.TodoWidget || { xPos: 0, yPos: 0 };
      const newTimerInfo = {
        ...currentTimer,
        xPos: currentTimer.xPos + delta.x,
        yPos: currentTimer.yPos + delta.y,
      };
      updateWidgetLayout("TodoWidget", newTimerInfo);
    },
    [updateWidgetLayout, widgetLayout.TodoWidget]
  );

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* header */}
      <div className="h-[50px]">
        <Header
          setOpenUISettings={setOpenUISettings}
          setOpenAccSettings={setOpenAccSettings}
          setIsTimerActive={setIsTimerActive}
          setIsTodoActive={setIsTodoActive}
          setOpenUserStats={setOpenUserStats}
          isTimerActive={isTimerActive}
          isTodoActive={isTodoActive}
          hideElementsActive={hideElementsActive}
          hideAfterSeconds={hideAfterSeconds}
        />
      </div>

      {/* user stats */}
      <RenderModalComponent
        isOpen={openUserStats}
        Component={UserStats}
        props={{ setOpenUserStats, openUserStats }}
      />

      {/* appearance settings */}
      <RenderModalComponent
        isOpen={openUISettings}
        Component={Appearance}
        props={{
          setOpenUISettings,
          openUISettings,
          setHideElementsActive,
          setHideAfterSeconds,
        }}
      />

      {/* user settings */}
      <RenderModalComponent
        isOpen={openAccSettings}
        Component={UserAccount}
        props={{ setOpenAccSettings, openAccSettings }}
      />

      {/* timer */}
      {isTimerActive && (
        <DndContext
          modifiers={[restrictToBoundingBox(openSettings)]}
          onDragEnd={(event) => {
            const { delta } = event;
            handleTimerDragEnd(delta);
          }}
          id={dndId}
        >
          <PomoTimer
            setOpenSettings={setOpenSettings}
            openSettings={openSettings}
            setIsTimerActive={setIsTimerActive}
            widgetInfo={widgetLayout.TimerWidget}
            activeWidget={activeWidget}
            setActiveWidget={setActiveWidget}
          />
        </DndContext>
      )}

      {/* todo */}
      {isTodoActive && (
        <Suspense>
          <DndContext
            modifiers={[restrictToTodoBoundingBox(dimensions)]}
            onDragEnd={(event) => {
              const { delta } = event;
              handleTodoDragEnd(delta);
            }}
            id={dndId}
          >
            <Task
              setIsTodoActive={setIsTodoActive}
              widgetInfo={widgetLayout.TodoWidget}
              setDimensions={setDimensions}
              dimensions={dimensions}
              activeWidget={activeWidget}
              setActiveWidget={setActiveWidget}
            />
          </DndContext>
        </Suspense>
      )}
    </>
  );
};

export default WorkspaceContent;
