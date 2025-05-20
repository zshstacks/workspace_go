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
import { restrictToPaintBoundingBox } from "@/app/hooks/restrictToPaintBoundingBox";
import { restrictToMediaBoundingBox } from "@/app/hooks/restrictToMediaBoundingBox";

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
const BackgroundSelectVideo = lazy(
  () => import("../../Header/BackgroundSelect/BackgroundSelect")
);
const PomoTimer = lazy(() => import("./PomoTimer/PomoTimer"));
const Paint = lazy(() => import("./Paint/Paint"));
const Media = lazy(() => import("./MediaPlayer/MediaPlayer"));

const WorkspaceContent = () => {
  const [openUISettings, setOpenUISettings] = useToggleState(false);
  const [openAccSettings, setOpenAccSettings] = useToggleState(false);
  const [openSettings, setOpenSettings] = useToggleState(false);
  const [isTimerActive, setIsTimerActive] = useToggleState(true);
  const [isTodoActive, setIsTodoActive] = useToggleState(false);
  const [isPaintActive, setIsPaintActive] = useToggleState(false);
  const [openUserStats, setOpenUserStats] = useToggleState(false);
  const [isMediaActive, setIsMediaActive] = useToggleState(false);
  const [openBackgroundSelect, setOpenBackgroundSelect] = useToggleState(false);

  const [hideElementsActive, setHideElementsActive] = useState(false);
  const [hideAfterSeconds, setHideAfterSeconds] = useState<number>(30);
  const [dimensions, setDimensions] = useState({ width: 490, height: 478 });
  const [dimensionsPaint, setDimensionsPaint] = useState({
    width: 1100,
    height: 750,
  });
  const [dimensionsMedia, setDimensionsMedia] = useState({
    width: 590,
    height: 478,
  });
  const [activeWidget, setActiveWidget] = useState<
    "todo" | "pomodoro" | "paint" | "media"
  >("pomodoro");
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
      const currentTodo = widgetLayout.TodoWidget || { xPos: 0, yPos: 0 };
      const newTodoInfo = {
        ...currentTodo,
        xPos: currentTodo.xPos + delta.x,
        yPos: currentTodo.yPos + delta.y,
      };
      updateWidgetLayout("TodoWidget", newTodoInfo);
    },
    [updateWidgetLayout, widgetLayout.TodoWidget]
  );

  const handlePaintDragEnd = useCallback(
    (delta: { x: number; y: number }) => {
      const currentPaint = widgetLayout.PaintWidget || { xPos: 0, yPos: 0 };
      const newPaintInfo = {
        ...currentPaint,
        xPos: currentPaint.xPos + delta.x,
        yPos: currentPaint.yPos + delta.y,
      };
      updateWidgetLayout("PaintWidget", newPaintInfo);
    },
    [updateWidgetLayout, widgetLayout.PaintWidget]
  );

  const handleMediaDragEnd = useCallback(
    (delta: { x: number; y: number }) => {
      const currentMedia = widgetLayout.MediaWidget || { xPos: 0, yPos: 0 };
      const newMediaInfo = {
        ...currentMedia,
        xPos: currentMedia.xPos + delta.x,
        yPos: currentMedia.yPos + delta.y,
      };
      updateWidgetLayout("MediaWidget", newMediaInfo);
    },
    [updateWidgetLayout, widgetLayout.MediaWidget]
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
          setIsPaintActive={setIsPaintActive}
          setIsTodoActive={setIsTodoActive}
          setOpenUserStats={setOpenUserStats}
          setIsMediaActive={setIsMediaActive}
          setOpenBackgroundSelect={setOpenBackgroundSelect}
          isTimerActive={isTimerActive}
          isPaintActive={isPaintActive}
          isTodoActive={isTodoActive}
          isMediaActive={isMediaActive}
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

      {/* video background */}
      <RenderModalComponent
        isOpen={openBackgroundSelect}
        Component={BackgroundSelectVideo}
        props={{
          setOpenBackgroundSelect,
        }}
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

      {/* paint */}
      {isPaintActive && (
        <Suspense>
          <DndContext
            modifiers={[restrictToPaintBoundingBox(dimensionsPaint)]}
            onDragEnd={(event) => {
              const { delta } = event;
              handlePaintDragEnd(delta);
            }}
            id={dndId}
          >
            <Paint
              widgetInfo={widgetLayout.PaintWidget}
              activeWidget={activeWidget}
              setDimensionsPaint={setDimensionsPaint}
              dimensionsPaint={dimensionsPaint}
              setActiveWidget={setActiveWidget}
              setIsPaintActive={setIsPaintActive}
            />
          </DndContext>
        </Suspense>
      )}

      {/* media */}
      {isMediaActive && (
        <Suspense>
          <DndContext
            modifiers={[restrictToMediaBoundingBox(dimensionsMedia)]}
            onDragEnd={(event) => {
              const { delta } = event;
              handleMediaDragEnd(delta);
            }}
            id={dndId}
          >
            <Media
              widgetInfo={widgetLayout.MediaWidget}
              activeWidget={activeWidget}
              setDimensionsMedia={setDimensionsMedia}
              dimensionsMedia={dimensionsMedia}
              setActiveWidget={setActiveWidget}
              setIsMediaActive={setIsMediaActive}
            />
          </DndContext>
        </Suspense>
      )}
    </>
  );
};

export default WorkspaceContent;
