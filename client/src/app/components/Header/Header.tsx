"use client";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import UserMenu from "./UserMenu/UserMenu";
import { MyContext } from "@/app/components/Workspace/Workspace";
import { HeaderProps } from "@/app/utility/types/types";
import { useToggleState } from "@/app/hooks/useToggleState";

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

import "animate.css";

import { Howl } from "howler";

const Header: React.FC<HeaderProps> = ({
  setOpenUISettings,
  setOpenAccSettings,
  setIsTimerActive,
  setIsTodoActive,
  isTimerActive,
  isTodoActive,
  hideElementsActive,
  hideAfterSeconds,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [openUserMenu, setOpenUserMenu] = useToggleState(false);

  const [isVisible, setIsVisible] = useState(false);

  const [animation, setAnimation] = useState("animate__slideInDown");

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.2);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Header component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  const rainSoundRef = useRef<Howl | null>(null);

  const handleRainSound = () => {
    if (!rainSoundRef.current) return;

    if (!isSoundEnabled) {
      rainSoundRef.current.play();
    } else {
      rainSoundRef.current.stop();
    }
    setIsSoundEnabled(!isSoundEnabled);
  };

  const toggleFullscreenMode = () => {
    const element = document.documentElement;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  //focus timer
  const resetTimer = useCallback(() => {
    setAnimation("animate__slideInDown");
    setIsVisible(true);

    if (hideElementsActive) {
      clearTimeout((window as any).headerTimeout);
      (window as any).headerTimeout = setTimeout(() => {
        setAnimation("animate__slideOutUp");
        setTimeout(() => setIsVisible(false), 500);
      }, hideAfterSeconds * 1000);
    }
  }, [hideElementsActive, hideAfterSeconds]);

  useEffect(() => {
    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("keydown", resetTimer);

    return () => {
      document.removeEventListener("mousemove", resetTimer);
      document.removeEventListener("keydown", resetTimer);
    };
  }, [resetTimer]);

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

  if (!isVisible) return null;

  return (
    <header
      className={`w-full p-2 flex justify-between items-center fixed  h-[50px] animate__animated  ${animation} `}
    >
      {/* Left Section */}
      <div className="bg-main dark:bg-lightMain rounded-md w-12 h-[32px] flex justify-center items-center ">
        <div className="flex hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md py-[2px] px-[4px]  cursor-pointer">
          <span className="text-white dark:text-lightText text-md mr-1">2</span>
          <BsFire color="darkorange" size={19} />
        </div>
      </div>

      {/* center section */}
      <div className="flex justify-center bg-main dark:bg-lightMain rounded-md w-[88px] h-[32px]">
        {/* timer */}
        <div
          className="flex my-auto ml-2 p-1  hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsTimerActive}
        >
          <MdOutlineTimer
            size={19}
            color={`${
              isTimerActive
                ? " #e89688"
                : theme === "dark"
                ? "#4e4e4e"
                : "white"
            }
              `}
          />
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder my-auto mx-2"></div>

        {/* todo */}
        <div
          className="flex my-auto mr-2 p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer"
          onClick={setIsTodoActive}
        >
          <LuPencilLine
            size={19}
            color={`${
              isTodoActive ? " #e89688" : theme === "dark" ? "#4e4e4e" : "white"
            }
              `}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center bg-main dark:bg-lightMain rounded-md text-white p-1 ">
        <div className="relative inline-block group">
          <div
            className="hover:bg-neutral-600 dark:hover:bg-neutral-300 p-1 hover:rounded-md cursor-pointer   "
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
          <div className="absolute -right-2 bg-main rounded-md p-2 invisible group-hover:visible w-[122px]  ">
            <label htmlFor="" className="block ">
              Volume: {volume}
            </label>{" "}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-[2px] m-auto bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-gray-300"
            />
          </div>
        </div>

        {/* divider */}
        <div className="h-5 w-[1px] bg-gray-500 dark:bg-lightBorder mx-2"></div>
        {/* enter/exit fullscreen */}
        <div
          className="hover:bg-neutral-600 dark:hover:bg-neutral-300 p-1 hover:rounded-md cursor-pointer"
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
          onClick={setOpenUserMenu}
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
          <UserMenu
            setOpenUISettings={setOpenUISettings}
            setOpenAccSettings={setOpenAccSettings}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
