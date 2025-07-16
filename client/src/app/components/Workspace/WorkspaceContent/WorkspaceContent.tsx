"use client";

import React, {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useMemo,
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
import { restrictToQuoteBoundingBox } from "@/app/hooks/restrictToQuoteBoundingBox";

import { CgSpinnerAlt } from "react-icons/cg";
import Footer from "../../Footer/Footer";

const localStorageKey = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY as string;
const widgetOpacity = process.env
  .NEXT_PUBLIC_LOCAL_STORAGE_KEY_OPACITY as string;

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
const Quote = lazy(() => import("./Quote/Quote"));

const WidgetSkeleton = memo(() => (
  <div className="animate-spin absolute">
    <CgSpinnerAlt color="white" size={20} />
  </div>
));

WidgetSkeleton.displayName = "WidgetSkeleton";

const WorkspaceContent = () => {
  const [openUISettings, setOpenUISettings] = useToggleState(false);
  const [openAccSettings, setOpenAccSettings] = useToggleState(false);
  const [openSettings, setOpenSettings] = useToggleState(false);
  const [isTimerActive, setIsTimerActive] = useToggleState(false);
  const [isTodoActive, setIsTodoActive] = useToggleState(false);
  const [isPaintActive, setIsPaintActive] = useToggleState(false);
  const [openUserStats, setOpenUserStats] = useToggleState(false);
  const [isMediaActive, setIsMediaActive] = useToggleState(false);
  const [isQuoteActive, setIsQuoteActive] = useToggleState(false);
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
  const [dimensionsQuote] = useState({
    width: 590,
    height: 478,
  });
  const [activeWidget, setActiveWidget] = useState<
    "todo" | "pomodoro" | "paint" | "media" | "quote"
  >("pomodoro");
  const [isClient, setIsClient] = useState(false);
  const [widgetLayout, setWidgetLayout] = useState<SavedWidgetLayoutInfo>({});
  const [opacity, setOpacity] = useState(1);

  const dndId = useId(); //generate unique id

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const [savedPosition, savedOpacity] = [
          localStorage.getItem(localStorageKey),
          localStorage.getItem(widgetOpacity),
        ];

        if (savedPosition) {
          setWidgetLayout(JSON.parse(savedPosition));
        }
        if (savedOpacity) {
          setOpacity(Number(savedOpacity));
        }
      } catch (error) {
        console.warn("Failed to load from localStorage:", error);
      }
    };

    setIsClient(true);

    requestAnimationFrame(loadStoredData);
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

  const handleQuoteDragEnd = useCallback(
    (delta: { x: number; y: number }) => {
      const currentQuote = widgetLayout.QuoteWidget || { xPos: 0, yPos: 0 };
      const newQuoteInfo = {
        ...currentQuote,
        xPos: currentQuote.xPos + delta.x,
        yPos: currentQuote.yPos + delta.y,
      };
      updateWidgetLayout("QuoteWidget", newQuoteInfo);
    },
    [updateWidgetLayout, widgetLayout.QuoteWidget]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(widgetOpacity, opacity.toString());
      } catch (error) {
        console.warn("Failed to save opacity:", error);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [opacity]);

  // Memoized header props
  const headerProps = useMemo(
    () => ({
      setOpenUISettings,
      setOpenAccSettings,
      setIsTimerActive,
      setIsPaintActive,
      setIsTodoActive,
      setOpenUserStats,
      setIsMediaActive,
      setIsQuoteActive,
      setOpenBackgroundSelect,
      setOpacity,
      opacity,
      isTimerActive,
      isQuoteActive,
      isPaintActive,
      isTodoActive,
      isMediaActive,
      hideElementsActive,
      hideAfterSeconds,
    }),
    [
      setOpenUISettings,
      setOpenAccSettings,
      setIsTimerActive,
      setIsPaintActive,
      setIsTodoActive,
      setOpenUserStats,
      setIsMediaActive,
      setIsQuoteActive,
      setOpenBackgroundSelect,
      setOpacity,
      opacity,
      isTimerActive,
      isQuoteActive,
      isPaintActive,
      isTodoActive,
      isMediaActive,
      hideElementsActive,
      hideAfterSeconds,
    ]
  );

  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* header */}
      <div className="h-[50px]">
        <Header {...headerProps} />
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
        <Suspense fallback={<WidgetSkeleton />}>
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
              opacity={opacity}
            />
          </DndContext>
        </Suspense>
      )}

      {/* todo */}
      {isTodoActive && (
        <Suspense fallback={<WidgetSkeleton />}>
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
              opacity={opacity}
            />
          </DndContext>
        </Suspense>
      )}

      {/* paint */}
      {isPaintActive && (
        <Suspense fallback={<WidgetSkeleton />}>
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
              opacity={opacity}
            />
          </DndContext>
        </Suspense>
      )}

      {/* media */}
      {isMediaActive && (
        <Suspense fallback={<WidgetSkeleton />}>
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
              opacity={opacity}
              setDimensionsMedia={setDimensionsMedia}
              dimensionsMedia={dimensionsMedia}
              setActiveWidget={setActiveWidget}
              setIsMediaActive={setIsMediaActive}
            />
          </DndContext>
        </Suspense>
      )}

      {/* quote */}
      {isQuoteActive && (
        <Suspense fallback={<WidgetSkeleton />}>
          <DndContext
            modifiers={[restrictToQuoteBoundingBox(dimensionsQuote)]}
            onDragEnd={(event) => {
              const { delta } = event;
              handleQuoteDragEnd(delta);
            }}
            id={dndId}
          >
            <Quote
              widgetInfo={widgetLayout.QuoteWidget}
              activeWidget={activeWidget}
              opacity={opacity}
              setActiveWidget={setActiveWidget}
              setIsQuoteActive={setIsQuoteActive}
            />
          </DndContext>
        </Suspense>
      )}
      <div>
        <Footer />
      </div>
    </>
  );
};

export default WorkspaceContent;
