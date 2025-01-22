"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";

import UserMenu from "./UserMenu/UserMenu";
import { HeaderProps } from "@/app/utility/types/types";
import { useToggleState } from "@/app/hooks/useToggleState";

import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { BsFire } from "react-icons/bs";
import { LuUserRound } from "react-icons/lu";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
  MdOutlineTimer,
} from "react-icons/md";

import "animate.css";
import { MyContext } from "../Pomodoro/Pomodoro";

const Header: React.FC<HeaderProps> = ({
  setOpenUISettings,
  setOpenAccSettings,
  setIsTimerActive,
  isTimerActive,
  hideElementsActive,
  hideAfterSeconds,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useToggleState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animation, setAnimation] = useState("animate__slideInDown");

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Header component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  const toggleFullscreenMode = () => {
    const element = document.documentElement;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

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

  if (!isVisible) return null;

  return (
    <header
      className={`w-full p-2 flex justify-between items-center fixed  h-[50px] animate__animated ${animation} `}
    >
      {/* Left Section */}
      <div className="bg-main dark:bg-lightMain rounded-md px-2 py-1 flex justify-center items-center ">
        <div className="flex hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md px-1  cursor-pointer">
          <span className="text-white dark:text-lightText text-md mr-1">2</span>
          <BsFire color="darkorange" size={19} />
        </div>
      </div>

      {/* center section */}
      <div className="flex justify-center text-center align-middle bg-main dark:bg-lightMain rounded-md w-9 h-[32px]">
        <div
          className="flex m-auto hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md hover:p-[3px] cursor-pointer"
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
      </div>

      {/* Right Section */}
      <div className="flex items-center bg-main dark:bg-lightMain rounded-md text-white p-1 ">
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
          className="flex items-center  p-1 hover:bg-neutral-600 dark:hover:bg-neutral-300 hover:rounded-md  cursor-pointer transition-all"
          onClick={setOpenUserMenu}
        >
          <LuUserRound
            size={19}
            color={theme === "dark" ? "#4e4e4e" : "white"}
            className="mr-[2px]"
          />
          {openUserMenu ? (
            <MdOutlineKeyboardArrowDown
              color={theme === "dark" ? "#4e4e4e" : "white"}
              size={18}
            />
          ) : (
            <MdOutlineKeyboardArrowUp
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
