"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MyContext } from "../../Workspace";
import PomoTimerSettings from "./PomoTimerSettings/PomoTimerSettings";

import { PomoTimerProps } from "@/app/utility/types/componentTypes";
import { useToggleState } from "@/app/hooks/useToggleState";

import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { updateRemainingTime } from "@/app/redux/slices/pomodoroSlice/pomodoroSlice";
import {
  fetchTimerStatus,
  getPomodoroSettings,
  resetCompletedPomodoros,
  startPomodoro,
  stopPomodoro,
} from "@/app/redux/slices/pomodoroSlice/asyncActions";

import { FaRegWindowMinimize } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

import { Howl } from "howler";
import { useDraggable } from "@dnd-kit/core";
import PomoTimerPhases from "./PomoTimerPhases/PomoTimerPhases";

const PomoTimer: React.FC<PomoTimerProps> = ({
  widgetInfo,
  setOpenSettings,
  openSettings,
  setIsTimerActive,
  activeWidget,
  setActiveWidget,
  opacity,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [ishideCount, setIsHideCount] = useToggleState();

  const [timerSound, setTimerSound] = useState<string>(
    process.env.NEXT_PUBLIC_ALARM_AUDIO!
  );
  const [volume, setVolume] = useState(0.2);

  const dispatch: AppDispatch = useDispatch();
  const {
    settings,
    currentPhase,
    isRunning,
    remainingTime,
    completedPomodoros,
  } = useSelector((state: RootState) => state.pomodoro);

  const alarmAudioRef = useRef<Howl | null>(null);
  const startAudioRef = useRef<Howl | null>(null);

  // theme context
  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "The PomoTimer component should be used within MyContext.Provider."
    );
  }
  const { theme } = context;

  // Audio
  useEffect(() => {
    startAudioRef.current = new Howl({
      src: [`${process.env.NEXT_PUBLIC_START_PAUSE_AUDIO}`],
      volume: 0.2,
    });

    return () => {
      startAudioRef.current?.unload();
    };
  }, []);

  // Memoized play audio function
  const playAudio = useCallback(() => {
    startAudioRef.current?.play();
  }, []);

  //alarm sounds
  useEffect(() => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.unload();
    }

    alarmAudioRef.current = new Howl({
      src: [timerSound],
      volume: volume,
    });

    return () => {
      alarmAudioRef.current?.unload();
    };
  }, [timerSound, volume]);

  //change volume
  useEffect(() => {
    if (alarmAudioRef.current) {
      alarmAudioRef.current.volume(volume);
    }
  }, [volume]);

  const startAlarmAudio = useCallback(() => {
    alarmAudioRef.current?.play();
  }, [alarmAudioRef]);

  // Start/Stop timer
  const handleStart = useCallback(() => {
    if (!isRunning) {
      dispatch(startPomodoro(currentPhase));
      playAudio();
    }
  }, [dispatch, currentPhase, isRunning, playAudio]);

  const handleStop = useCallback(async () => {
    await dispatch(stopPomodoro());
    dispatch(fetchTimerStatus());
    playAudio();
  }, [dispatch, playAudio]);

  const handleReset = useCallback(async () => {
    await dispatch(resetCompletedPomodoros());
    dispatch(fetchTimerStatus());
  }, [dispatch]);

  // format time
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  }, []);

  // Restores the original time if the timer is not running
  useEffect(() => {
    if (!isRunning) {
      const updateInitialTime = () => {
        let initialTime = 0;
        if (currentPhase === "pomodoro") {
          initialTime = settings.pomodoro * 60;
        } else if (currentPhase === "shortBreak") {
          initialTime = settings.shortBreak * 60;
        } else if (currentPhase === "longBreak") {
          initialTime = settings.longBreak * 60;
        }
        dispatch(updateRemainingTime(initialTime));
      };
      updateInitialTime();
    }
  }, [
    currentPhase,
    settings.pomodoro,
    settings.shortBreak,
    settings.longBreak,
    dispatch,
    isRunning,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F1" && !isRunning) {
        handleStart();
      } else if (e.key === "F1" && isRunning) {
        handleStop();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, handleStart, handleStop]);

  // timer isRunning then refresh time
  useEffect(() => {
    if (isRunning) {
      let lastUpdateTime = Date.now();
      let animationFrameId: number;

      const updateTimer = () => {
        const now = Date.now();
        // Only fetch timer status every second instead of every frame
        if (now - lastUpdateTime >= 1000) {
          dispatch(fetchTimerStatus());
          lastUpdateTime = now;
        }
        animationFrameId = requestAnimationFrame(updateTimer);
      };

      animationFrameId = requestAnimationFrame(updateTimer);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [dispatch, isRunning]);

  // alarm audio if timer = 1
  useEffect(() => {
    if (remainingTime === 1) {
      startAlarmAudio();
    }
  }, [remainingTime, startAlarmAudio]);

  // website title change
  useEffect(() => {
    document.title = isRunning
      ? `${formatTime(remainingTime)} | ${currentPhase}`
      : "workspace_go by zshstacks";
  }, [remainingTime, isRunning, currentPhase, formatTime]);

  //after page refresh if timer isRunning, it sets to 0(so basically bug fix when i cant start the timer again after page reload bcs of redis caching)
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isRunning) {
        await dispatch(stopPomodoro());
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch, isRunning]);

  // fetch settings
  useEffect(() => {
    dispatch(getPomodoroSettings());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTimerStatus());
  }, [dispatch]);

  //=====================
  // DnD logic
  //=====================

  const staticPosition = widgetInfo ? widgetInfo : { xPos: 0, yPos: 0 };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dragging,
  } = useDraggable({
    id: "pomo-timer",
  });

  const dynamicPosition = transform
    ? { x: transform.x, y: transform.y }
    : { x: 0, y: 0 };

  const combinedPosition = {
    xPos: staticPosition.xPos + dynamicPosition.x,
    yPos: staticPosition.yPos + dynamicPosition.y,
  };

  useEffect(() => {
    setIsDragging(dragging);
  }, [dragging]);

  const pomodoroCounts = useMemo(() => {
    if (ishideCount) return null;

    const displayCount =
      currentPhase === "longBreak" ? 4 : completedPomodoros % 4;

    return (
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => {
          const indicatorClass =
            i < displayCount
              ? "bg-secondary "
              : "bg-gray-500 dark:bg-neutral-400";

          return (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${indicatorClass}`}
            ></div>
          );
        })}
      </div>
    );
  }, [ishideCount, currentPhase, completedPomodoros]);

  return (
    <div
      onMouseDown={() => setActiveWidget("pomodoro")}
      className="bg-main dark:bg-lightMain text-white w-[360px] p-4 rounded-lg shadow-md shadow-white/5 dark:shadow-black/10"
      style={{
        opacity: opacity,
        transform: `translate3d(${combinedPosition?.xPos}px, ${combinedPosition?.yPos}px, 0)`,
        position: "fixed",
        zIndex: activeWidget === "pomodoro" ? 100 : 50,
      }}
    >
      {/* Header */}
      <div className="flex  items-center pb-[11px]">
        {/* pomodoro count */}
        {pomodoroCounts}

        {/* "Drag handle" element */}
        <div
          className="w-[270px] h-[40px] absolute"
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        ></div>

        <button
          className="text-gray-400 dark:text-lightText  absolute top-1 right-4"
          onClick={setIsTimerActive}
        >
          <FaRegWindowMinimize
            size={14}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </button>
      </div>

      {/* divider */}
      <div className="w-[360px] h-[1px] bg-white/25 dark:bg-lightBorder absolute right-0 "></div>

      {/* Timer */}
      <div className="flex justify-center mt-6">
        <div className="w-full">
          <h1 className="text-5xl dark:text-lightText font-bold">
            {formatTime(remainingTime)}
          </h1>
        </div>

        {/* actions */}
        <div className="flex m-auto gap-4">
          {/* start stop btn*/}
          <button
            className="px-8 py-1 bg-transparent border border-white dark:border-lightBorder rounded-lg"
            onClick={isRunning ? handleStop : handleStart}
          >
            <span className="font-semibold text-md dark:text-lightText">
              {isRunning ? "Stop" : "Start"}
            </span>
          </button>
          {/* refresh btn */}
          <button className="" onClick={handleReset}>
            <FiRefreshCw
              color={theme === "dark" ? "#4e4e4e" : "white"}
              size={20}
            />
          </button>
        </div>
      </div>

      {/* phases */}
      <PomoTimerPhases setOpenSettings={setOpenSettings} />

      {openSettings && (
        <PomoTimerSettings
          setIsHideCount={setIsHideCount}
          ishideCount={ishideCount}
          setTimerSound={setTimerSound}
          volume={volume}
          setVolume={setVolume}
        />
      )}
    </div>
  );
};

export default PomoTimer;
