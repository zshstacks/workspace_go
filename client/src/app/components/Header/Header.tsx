"use client";

import React, {
  lazy,
  memo,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MyContext } from "@/app/components/Workspace/Workspace";
import { HeaderProps } from "@/app/utility/types/componentTypes";

import {
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiOutlineMuted,
  AiOutlineSound,
} from "react-icons/ai";
import { BsFire } from "react-icons/bs";
import { LuPencilLine, LuUserRound } from "react-icons/lu";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
  MdOutlineTimer,
} from "react-icons/md";
import { PiPaintBucketBold, PiSelectionBackground } from "react-icons/pi";
import { RiYoutubeLine } from "react-icons/ri";
import { CgDropOpacity } from "react-icons/cg";
import { LiaQuoteRightSolid } from "react-icons/lia";

import "animate.css";

import { Howl } from "howler";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllStats,
  updateDailyStreak,
} from "@/app/redux/slices/statsSlice/asyncActions";
import { useToggleStateOutside } from "@/app/hooks/useToggleStateOutside";

const UserMenu = lazy(() => import("./UserMenu/UserMenu"));

// Memoized icon components
const TimerIcon = memo(
  ({ isActive, theme }: { isActive: boolean; theme: string }) => (
    <MdOutlineTimer
      size={19}
      color={isActive ? "#e89688" : theme === "dark" ? "#4e4e4e" : "white"}
    />
  )
);
TimerIcon.displayName = "TimerIcon";

const TodoIcon = memo(
  ({ isActive, theme }: { isActive: boolean; theme: string }) => (
    <LuPencilLine
      size={19}
      color={isActive ? "#e89688" : theme === "dark" ? "#4e4e4e" : "white"}
    />
  )
);
TodoIcon.displayName = "TodoIcon";

const PaintIcon = memo(
  ({ isActive, theme }: { isActive: boolean; theme: string }) => (
    <PiPaintBucketBold
      size={19}
      color={isActive ? "#e89688" : theme === "dark" ? "#4e4e4e" : "white"}
    />
  )
);
PaintIcon.displayName = "PaintIcon";

const MediaIcon = memo(
  ({ isActive, theme }: { isActive: boolean; theme: string }) => (
    <RiYoutubeLine
      size={20}
      color={isActive ? "#e89688" : theme === "dark" ? "#4e4e4e" : "white"}
    />
  )
);
MediaIcon.displayName = "MediaIcon";

const QuoteIcon = memo(
  ({ isActive, theme }: { isActive: boolean; theme: string }) => (
    <LiaQuoteRightSolid
      size={20}
      color={isActive ? "#e89688" : theme === "dark" ? "#4e4e4e" : "white"}
    />
  )
);
QuoteIcon.displayName = "QuoteIcon";

const VolumeSlider = memo(
  ({
    value,
    onChange,
    min = "0",
    max = "1",
    step = "0.1",
  }: {
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min?: string;
    max?: string;
    step?: string;
  }) => (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full flex h-[2px] m-auto bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-gray-300 dark:accent-gray-300 dark:hover:accent-gray-400"
    />
  )
);
VolumeSlider.displayName = "VolumeSlider";

const Header: React.FC<HeaderProps> = ({
  setOpenUISettings,
  setOpenAccSettings,
  setIsTimerActive,
  setIsPaintActive,
  setIsTodoActive,
  setIsMediaActive,
  setIsQuoteActive,
  setOpenUserStats,
  setOpenBackgroundSelect,
  setOpacity,
  opacity,
  isTimerActive,
  isPaintActive,
  isTodoActive,
  isMediaActive,
  isQuoteActive,
  hideElementsActive,
  hideAfterSeconds,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [animation, setAnimation] = useState("animate__slideInDown");
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.2);

  const [openUserMenu, setOpenUserMenu, toggleOpenUserMenu] =
    useToggleStateOutside(false);

  const dispatch: AppDispatch = useDispatch();
  const { currentStreak } = useSelector((state: RootState) => state.stats);

  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "The Header component should be used within MyContext.Provider."
    );
  }
  const { theme } = context;

  const rainSoundRef = useRef<Howl | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerTimeoutRef = useRef<number | null>(null); //memory leaks fix
  const mouseMoveTimeoutRef = useRef<number | null>(null);

  // Optimized click outside handler
  useEffect(() => {
    if (!openUserMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setOpenUserMenu(false);
      }
    };

    // Use requestIdleCallback for non-critical operations
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, {
        passive: true,
      });
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openUserMenu, setOpenUserMenu]);

  const handleRainSound = () => {
    if (!rainSoundRef.current) return;

    if (!isSoundEnabled) {
      rainSoundRef.current.play();
    } else {
      rainSoundRef.current.stop();
    }
    setIsSoundEnabled(!isSoundEnabled);
  };

  //rain sound only once
  useEffect(() => {
    rainSoundRef.current = new Howl({
      src: [`${process.env.NEXT_PUBLIC_RAIN_AUDIO}`],
      volume: volume,
      loop: true,
    });

    return () => {
      rainSoundRef.current?.unload();
    };
  }, []);

  //change sound volume
  useEffect(() => {
    if (rainSoundRef.current) {
      rainSoundRef.current.volume(volume);
    }
  }, [volume]);

  // Optimized fullscreen toggle
  const toggleFullscreenMode = useCallback(() => {
    const element = document.documentElement;

    if (!document.fullscreenElement) {
      element
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(console.error);
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(console.error);
    }
  }, []);

  //focus timer
  const debouncedResetTimer = useCallback(() => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }

    mouseMoveTimeoutRef.current = window.setTimeout(() => {
      setAnimation("animate__slideInDown");
      setIsVisible(true);

      if (hideElementsActive && headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }

      if (hideElementsActive) {
        headerTimeoutRef.current = window.setTimeout(() => {
          setAnimation("animate__slideOutUp");
          setTimeout(() => setIsVisible(false), 500);
        }, hideAfterSeconds * 1000);
      }
    }, 16); // ~60fps throttling
  }, [hideElementsActive, hideAfterSeconds]);

  useEffect(() => {
    const handleMouseMove = () => debouncedResetTimer();
    const handleKeyDown = () => debouncedResetTimer();

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("keydown", handleKeyDown, { passive: true });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      if (headerTimeoutRef.current) {
        clearTimeout(headerTimeoutRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [debouncedResetTimer]);

  //stats
  useEffect(() => {
    dispatch(updateDailyStreak())
      .unwrap()
      .catch(() => {
        dispatch(getAllStats());
      });
  }, [dispatch]);

  const handlers = useMemo(
    () => ({
      opacity: (e: React.ChangeEvent<HTMLInputElement>) =>
        setOpacity(parseFloat(e.target.value)),
      volume: (e: React.ChangeEvent<HTMLInputElement>) =>
        setVolume(parseFloat(e.target.value)),
    }),
    [setOpacity]
  );

  //clenup on unmount
  useEffect(() => {
    return () => {
      rainSoundRef.current?.unload();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <header
      className={`w-full p-2 flex justify-between items-center fixed  h-[50px] animate__animated  ${animation} `}
    >
      {/* Left Section */}
      <div className="bg-main dark:bg-lightMain rounded-md  max-w-[24] h-[32px] flex justify-center items-center p-1">
        <div
          className="flex hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  py-[1px] px-[3px] cursor-pointer"
          title="stats"
          onClick={setOpenUserStats}
        >
          <span className="text-white dark:text-lightText text-md mr-1">
            {currentStreak}
          </span>
          <BsFire color="darkorange" size={19} className="m-auto" />
        </div>
      </div>

      {/* center section */}
      <div className="flex justify-center bg-main dark:bg-lightMain rounded-md min-w-[88px] h-[32px]">
        {/* timer */}
        <div
          className="flex my-auto ml-2 p-1  hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsTimerActive}
          title="pomodoro timer"
        >
          <TimerIcon isActive={isTimerActive} theme={theme} />
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder my-auto mx-2"></div>

        {/* todo */}
        <div
          className="flex my-auto  p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsTodoActive}
          title="todo"
        >
          <TodoIcon isActive={isTodoActive} theme={theme} />
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder my-auto mx-2"></div>

        {/* paint */}
        <div
          className="flex my-auto  p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsPaintActive}
          title="paint"
        >
          <PaintIcon isActive={isPaintActive} theme={theme} />
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder my-auto mx-2"></div>

        {/* media */}
        <div
          className="flex my-auto  p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsMediaActive}
          title="media"
        >
          <MediaIcon isActive={isMediaActive} theme={theme} />
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder my-auto mx-2"></div>

        {/* daily quote */}
        <div
          className="flex my-auto mr-2 p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsQuoteActive}
          title="quote"
        >
          <QuoteIcon isActive={isQuoteActive} theme={theme} />
        </div>
      </div>

      {/* Right Section */}
      <div
        ref={userMenuRef}
        className="flex items-center bg-main dark:bg-lightMain rounded-md text-white p-1 "
      >
        {/* opacity */}
        <div className="relative inline-block group">
          <div
            className="hover:bg-neutral-600 dark:hover:bg-neutral-300 p-1 hover:rounded-md cursor-pointer"
            title="opacity"
          >
            <CgDropOpacity
              size={19}
              color={theme === "dark" ? "#4e4e4e" : "white"}
            />
          </div>
          <div className="absolute -right-2 bg-main dark:bg-lightMain rounded-md p-4 invisible group-hover:visible w-[122px]  ">
            <VolumeSlider
              value={opacity}
              onChange={handlers.opacity}
              min="0.2"
              max="1"
              step="0.1"
            />
          </div>
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder mx-2"></div>
        {/* bg selection */}
        <div
          className="hover:bg-neutral-600 dark:hover:bg-neutral-300 p-1 hover:rounded-md cursor-pointer"
          title="backgrounds"
          onClick={setOpenBackgroundSelect}
        >
          <PiSelectionBackground
            size={19}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder mx-2"></div>
        {/*ambient  */}
        <div className="relative inline-block group">
          <div
            className="hover:bg-neutral-600 dark:hover:bg-neutral-300 p-1 hover:rounded-md cursor-pointer"
            title="ambient"
            aria-label={`${isSoundEnabled ? "Mute" : "Play"} ambient sound`}
            aria-pressed={isSoundEnabled}
            onClick={handleRainSound}
          >
            {isSoundEnabled ? (
              <AiOutlineSound
                size={19}
                color={theme === "dark" ? "#4e4e4e" : "white"}
              />
            ) : (
              <AiOutlineMuted
                size={19}
                color={theme === "dark" ? "#4e4e4e" : "white"}
              />
            )}
          </div>
          <div className="absolute -right-2 bg-main dark:bg-lightMain rounded-md p-4 invisible group-hover:visible w-[122px]  ">
            <VolumeSlider value={volume} onChange={handlers.volume} />
          </div>
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder mx-2"></div>
        {/* enter/exit fullscreen */}
        <div
          className="hover:bg-neutral-600 dark:hover:bg-neutral-300 p-1 hover:rounded-md cursor-pointer"
          title="fullscreen"
          onClick={toggleFullscreenMode}
        >
          {isFullscreen ? (
            <AiOutlineFullscreenExit
              size={19}
              color={theme === "dark" ? "#4e4e4e" : "white"}
            />
          ) : (
            <AiOutlineFullscreen
              size={19}
              color={theme === "dark" ? "#4e4e4e" : "white"}
            />
          )}
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder mx-2"></div>

        {/* user dropdown menu */}
        <div
          className="flex items-center  p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer transition-all "
          onClick={toggleOpenUserMenu}
        >
          <LuUserRound
            size={19}
            color={theme === "dark" ? "#4e4e4e" : "white"}
            className="mr-[2px]"
          />
          {openUserMenu ? (
            <MdOutlineKeyboardArrowUp
              color={theme === "dark" ? "#4e4e4e" : "white"}
              size={18}
            />
          ) : (
            <MdOutlineKeyboardArrowDown
              color={theme === "dark" ? "#4e4e4e" : "white"}
              size={18}
            />
          )}
        </div>

        {openUserMenu && (
          <Suspense>
            <UserMenu
              setOpenUISettings={setOpenUISettings}
              setOpenAccSettings={setOpenAccSettings}
            />
          </Suspense>
        )}
      </div>
    </header>
  );
};

export default React.memo(Header);
