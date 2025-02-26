"use client";

import React, { useEffect, useState } from "react";

import Header from "../../Header/Header";
import PomoTimer from "./PomoTimer/PomoTimer";
import Appearance from "../../Header/UserMenu/Appearance/Appearance";
import UserAccount from "../../Header/UserMenu/UserAccount/UserAccount";
import Task from "@/app/components/Workspace/WorkspaceContent/Task/Task";

import { DndContext } from "@dnd-kit/core";
import { SavedWidgetLayoutInfo, WidgetInfo } from "@/app/utility/types/types";
import { useToggleState } from "@/app/hooks/useToggleState";
import { restrictToBoundingBox } from "@/app/hooks/boundingBoxRes";
import { restrictToTodoBoundingBox } from "@/app/hooks/restrictToTodoBoundingBox";

const localStorageKey = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY as string;

const WorkspaceContent = () => {
  const [openUISettings, setOpenUISettings] = useToggleState(false);
  const [openAccSettings, setOpenAccSettings] = useToggleState(false);
  const [openSettings, setOpenSettings] = useToggleState(false);
  const [isTimerActive, setIsTimerActive] = useToggleState(true);
  const [isTodoActive, setIsTodoActive] = useToggleState(false);

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

  const updateWidgetLayout = (
    widgetKey: keyof SavedWidgetLayoutInfo,
    newInfo: WidgetInfo
  ) => {
    const updatedLayout: SavedWidgetLayoutInfo = {
      ...widgetLayout,
      [widgetKey]: newInfo,
    };
    setWidgetLayout(updatedLayout);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedLayout));
  };

  const handleTimerDragEnd = (delta: { x: number; y: number }) => {
    const currentTimer = widgetLayout.TimerWidget || { xPos: 0, yPos: 0 };
    const newTimerInfo = {
      ...currentTimer,
      xPos: currentTimer.xPos + delta.x,
      yPos: currentTimer.yPos + delta.y,
    };
    updateWidgetLayout("TimerWidget", newTimerInfo);
  };

  const handleTodoDragEnd = (delta: { x: number; y: number }) => {
    const currentTimer = widgetLayout.TodoWidget || { xPos: 0, yPos: 0 };
    const newTimerInfo = {
      ...currentTimer,
      xPos: currentTimer.xPos + delta.x,
      yPos: currentTimer.yPos + delta.y,
    };
    updateWidgetLayout("TodoWidget", newTimerInfo);
  };

  //reset pos (dev)
  // const resetPos = () => {
  //   const defaultPos = { xPos: 0, yPos: 0 };
  //   updateWidgetLayout("TimerWidget", defaultPos);
  //   updateWidgetLayout("TodoWidget", defaultPos);
  // };

  return (
    <>
      {/* header */}
      <div className="h-[50px]">
        <Header
          setOpenUISettings={setOpenUISettings}
          setOpenAccSettings={setOpenAccSettings}
          setIsTimerActive={setIsTimerActive}
          setIsTodoActive={setIsTodoActive}
          isTimerActive={isTimerActive}
          isTodoActive={isTodoActive}
          hideElementsActive={hideElementsActive}
          hideAfterSeconds={hideAfterSeconds}
        />
      </div>

      {/* dev */}
      {/* <div
        className="w-[15px] h-[10px]  absolute top-1/2 cursor-pointer z-[9999] "
        onClick={resetPos}
      >
        <span color="red" className=" border-2 bg-red-300 ">
          resetPos
        </span>
      </div> */}

      {/* appearance settings */}
      {openUISettings && (
        <Appearance
          openUISettings={openUISettings}
          setOpenUISettings={setOpenUISettings}
          setHideElementsActive={setHideElementsActive}
          setHideAfterSeconds={setHideAfterSeconds}
        />
      )}

      {/* user settings */}
      {openAccSettings && (
        <UserAccount
          setOpenAccSettings={setOpenAccSettings}
          openAccSettings={openAccSettings}
        />
      )}

      {/* timer */}
      {isTimerActive && (
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
      )}

      {/* todo */}
      {isTodoActive && (
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
      )}
    </>
  );
};

export default WorkspaceContent;
