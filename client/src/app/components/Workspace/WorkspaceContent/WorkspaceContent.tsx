"use client";

import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";

import Header from "../../Header/Header";

import { DndContext } from "@dnd-kit/core";
import { SavedWidgetLayoutInfo, WidgetInfo } from "@/app/utility/types/types";
import { useToggleState } from "@/app/hooks/useToggleState";
import { restrictToBoundingBox } from "@/app/hooks/boundingBoxRes";
import { restrictToTodoBoundingBox } from "@/app/hooks/restrictToTodoBoundingBox";
import { AiOutlineLoading } from "react-icons/ai";

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

  const [widgetLayout, setWidgetLayout] = useState<SavedWidgetLayoutInfo>({});

  useEffect(() => {
    const savedPosition = localStorage.getItem(localStorageKey);
    if (savedPosition) {
      setWidgetLayout(JSON.parse(savedPosition));
    }
  }, []);

  const updateWidgetLayout = useCallback(
    (widgetKey: keyof SavedWidgetLayoutInfo, newInfo: WidgetInfo) => {
      const updatedLayout: SavedWidgetLayoutInfo = {
        ...widgetLayout,
        [widgetKey]: newInfo,
      };
      setWidgetLayout(updatedLayout);
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLayout));
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

      {openUserStats && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]  ">
              <AiOutlineLoading
                size={23}
                color="white"
                className="animate-spin "
              />
            </div>
          }
        >
          <UserStats
            setOpenUserStats={setOpenUserStats}
            openUserStats={openUserStats}
          />
        </Suspense>
      )}
      {/* appearance settings */}
      {openUISettings && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]  ">
              <AiOutlineLoading
                size={23}
                color="white"
                className="animate-spin "
              />
            </div>
          }
        >
          <Appearance
            openUISettings={openUISettings}
            setOpenUISettings={setOpenUISettings}
            setHideElementsActive={setHideElementsActive}
            setHideAfterSeconds={setHideAfterSeconds}
          />
        </Suspense>
      )}

      {/* user settings */}
      {openAccSettings && (
        <Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]  ">
              <AiOutlineLoading
                size={23}
                color="white"
                className="animate-spin "
              />
            </div>
          }
        >
          <UserAccount
            setOpenAccSettings={setOpenAccSettings}
            openAccSettings={openAccSettings}
          />
        </Suspense>
      )}

      {/* timer */}
      {isTimerActive && (
        <Suspense>
          <DndContext
            modifiers={[restrictToBoundingBox(openSettings)]}
            onDragEnd={(event) => {
              const { delta } = event;
              handleTimerDragEnd(delta);
            }}
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
        </Suspense>
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
