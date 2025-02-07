"use client";

import { MyContext } from "@/app/components/Workspace/Workspace";
import { AppearanceProps } from "@/app/utility/types/types";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { IoIosCheckmark, IoIosClose } from "react-icons/io";
import { RiMoonLine, RiSunLine } from "react-icons/ri";

const Appearance: React.FC<AppearanceProps> = ({
  openUISettings,
  setOpenUISettings,
  setHideElementsActive,
  setHideAfterSeconds,
}) => {
  const [hideActive, setHideActive] = useState<boolean | null>(null);
  const [hideAfterSeconds, setHideAfterSecondsState] = useState<number>(30);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Appearance component should be used within MyContext.Provider."
    );
  }

  const { theme, setTheme } = context;

  const clickAudio = useMemo(() => {
    return new Howl({
      src: [`${process.env.NEXT_PUBLIC_CLICK_AUDIO}`],
      volume: 0.5,
    });
  }, []);

  const toggleTheme = () => {
    const timeout = setTimeout(() => {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));

      clickAudio.play();
    }, 100);
    return () => clearInterval(timeout);
  };

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHideActive(e.target.checked);
  };

  const handleHideAfterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value > 60) value = 60;
    setHideAfterSecondsState(value);
    localStorage.setItem("hideAfterSeconds", value.toString());
    setHideAfterSeconds(value);
  };

  const handleCloseUISettings = () => {
    setOpenUISettings(false);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const storedHideActive = localStorage.getItem("hideActive");
    const storedHideAfterSeconds = localStorage.getItem("hideAfterSeconds");

    if (storedHideActive !== null) {
      const parsedHideActive = storedHideActive === "true";
      setHideActive(parsedHideActive);
      setHideElementsActive(parsedHideActive);
    } else {
      localStorage.setItem("hideActive", "false");
      setHideActive(false);
      setHideElementsActive(false);
    }

    if (storedHideAfterSeconds !== null) {
      const parsedHideAfterSeconds = Math.min(
        Math.max(parseInt(storedHideAfterSeconds), 1),
        60
      );
      setHideAfterSecondsState(parsedHideAfterSeconds);
      setHideAfterSeconds(parsedHideAfterSeconds);
    } else {
      localStorage.setItem("hideAfterSeconds", "30");
      setHideAfterSeconds(30);
    }
  }, [setHideElementsActive, setHideAfterSeconds]);

  useEffect(() => {
    if (hideActive !== null) {
      localStorage.setItem("hideActive", hideActive.toString());
      setHideElementsActive(hideActive);
    }
  }, [hideActive, setHideElementsActive]);

  if (hideActive === null) {
    return null;
  }

  return (
    <>
      {openUISettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999] ">
          <div className="w-96 bg-main dark:bg-lightMain  rounded-lg shadow-lg">
            {/* close btn */}
            <div className="flex justify-end relative">
              <button
                className="m-1 cursor-pointer"
                onClick={handleCloseUISettings}
              >
                <IoIosClose
                  color={theme === "dark" ? "#4e4e4e" : "white"}
                  size={22}
                />
              </button>
            </div>
            <div className="py-1 px-7">
              {/* title */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-100 dark:text-lightText">
                  Appearance Settings
                </h2>
              </div>
              {/* theme */}
              <div className="flex flex-col gap-3 mb-10">
                <h5 className="text-gray-500 text-[12px] dark:text-lightText">
                  THEME
                </h5>
                <div className="flex justify-between">
                  <span className="text-gray-100 text-sm font-semibold my-auto dark:text-lightText">
                    {theme === "dark" ? (
                      <span>Light Mode</span>
                    ) : (
                      <span>Dark Mode</span>
                    )}
                  </span>
                  <button
                    onClick={toggleTheme}
                    className="w-12 h-8 border border-gray-500 dark:border-lightBorder rounded-md flex justify-center"
                  >
                    {theme === "dark" ? (
                      <RiSunLine
                        size={22}
                        color={theme === "dark" ? "#4e4e4e" : "white"}
                        className="my-auto  "
                      />
                    ) : (
                      <RiMoonLine
                        size={22}
                        color={theme === "light" ? "white" : "#4e4e4e"}
                        className="my-auto "
                      />
                    )}
                  </button>
                </div>
              </div>
              {/* focus mode */}
              <div className="flex flex-col gap-3 mb-10">
                <h5 className="text-gray-500 dark:text-lightText text-[12px]">
                  FOCUS MODE
                </h5>
                <div className="flex justify-between">
                  <span className="text-gray-100 dark:text-lightText text-sm font-semibold">
                    Hide Elements
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      onChange={handleCheckBox}
                      checked={hideActive}
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-5 h-5 bg-main border border-gray-600 dark:bg-lightMain dark:border-lightBorder rounded-sm flex items-center justify-center pointer-events-none">
                      {hideActive && (
                        <IoIosCheckmark
                          size={32}
                          color={theme === "dark" ? "#4e4e4e" : "white"}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-100 dark:text-lightText text-sm font-semibold my-auto">
                    Hide After(seconds)
                  </span>
                  <input
                    type="number"
                    value={hideAfterSeconds}
                    onChange={handleHideAfterChange}
                    className="w-16 h-8 bg-main dark:bg-lightMain text-gray-100 dark:text-lightText text-sm font-semibold border border-gray-600 dark:border-lightBorder  rounded-md px-[10px] focus:outline-none focus:ring-1 focus:ring-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    defaultValue={30}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Appearance;
