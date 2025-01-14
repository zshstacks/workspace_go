"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import Header from "../../Header/Header";
import PomoTimer from "./PomoTimer/PomoTimer";
import Appearance from "../../Header/UserMenu/Appearance/Appearance";
import UserAccount from "../../Header/UserMenu/UserAccount/UserAccount";

import { DndContext } from "@dnd-kit/core";
import { Position } from "@/app/utility/types/types";
import { useToggleState } from "@/app/hooks/useToggleState";
import { restrictToBoundingBox } from "@/app/hooks/boundingBoxRes";

const localStorageKey = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY as string;

const PomodoroContent = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [openUISettings, setOpenUISettings] = useToggleState(false);
  const [openAccSettings, setOpenAccSettings] = useToggleState(false);
  const [openSettings, setOpenSettings] = useToggleState(false);
  const [isTimerActive, setIsTimerActive] = useToggleState(true);
  const [hideElementsActive, setHideElementsActive] = useState(false);

  // load saved pos from localstorage, if there is
  useEffect(() => {
    const savedPosition = localStorage.getItem(localStorageKey);
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  // save new pos to localstorage
  const savePosition = (newPosition: Position) => {
    setPosition(newPosition);
    localStorage.setItem(localStorageKey, JSON.stringify(newPosition));
  };

  //reset pos (dev)
  const resetPos = () => {
    const resetPosition = { x: 0, y: 0 };
    setPosition(resetPosition);
    localStorage.setItem(localStorageKey, JSON.stringify(resetPosition));
  };

  return (
    <>
      {/* header */}
      <div className="h-[50px]">
        <Header
          setOpenUISettings={setOpenUISettings}
          setOpenAccSettings={setOpenAccSettings}
          setIsTimerActive={setIsTimerActive}
          isTimerActive={isTimerActive}
          hideElementsActive={hideElementsActive}
        />
      </div>

      {/* dev */}
      <div
        className="w-[15px] h-[10px]  absolute top-1/2 cursor-pointer z-[9999] "
        onClick={resetPos}
      >
        <span color="red" className=" border-2 bg-red-300 ">
          resetPos
        </span>
      </div>

      <div className="w-[15px] h-[10px]  absolute top-[55%] cursor-pointer z-[9999]">
        <span className="border-2 bg-red-300">
          <Link href="/signin">Auth</Link>
        </span>
      </div>

      {openUISettings && (
        <Appearance
          openUISettings={openUISettings}
          setOpenUISettings={setOpenUISettings}
          setHideElementsActive={setHideElementsActive}
        />
      )}

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
            const newPosition = {
              x: position.x + delta.x,
              y: position.y + delta.y,
            };
            savePosition(newPosition);
          }}
        >
          <PomoTimer
            position={position}
            setOpenSettings={setOpenSettings}
            openSettings={openSettings}
            setIsTimerActive={setIsTimerActive}
          />
        </DndContext>
      )}
    </>
  );
};

export default PomodoroContent;
