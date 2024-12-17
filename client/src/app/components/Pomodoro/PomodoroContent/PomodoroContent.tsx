"use client";

import React, { useEffect, useState } from "react";
import Header from "../../Header/Header";
import PomoTimer from "./PomoTimer/PomoTimer";
import { DndContext } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Position } from "@/app/utility/types/types";
import Appearance from "../../Header/UserMenu/Appearance/Appearance";

const localStorageKey =
  process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || "widgetPosition";

const PomodoroContent = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [openUISettings, setOpenUISettings] = useState(false);

  const openAppearance = () => {
    setOpenUISettings(!openUISettings);
  };

  // load saved pos from localstorage, if there is
  useEffect(() => {
    const savedPosition = localStorage.getItem(localStorageKey);
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  // save new pos localstorage
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
      <div className="h-[50px] ">
        <Header openAppearance={openAppearance} />
        <div
          className="w-[15px] h-[10px]  absolute right-1/2 cursor-pointer  "
          onClick={resetPos}
        >
          <span color="red" className=" border-2 bg-red-300 ">
            resetPos
          </span>
        </div>
        {openUISettings && (
          <Appearance
            openUISettings={openUISettings}
            openAppearance={openAppearance}
          />
        )}
      </div>

      {/* timer */}

      <div className="flex-grow flex justify-center items-center ">
        <DndContext
          modifiers={[restrictToWindowEdges]}
          onDragEnd={(event) => {
            const { delta } = event;
            const newPosition = {
              x: position.x + delta.x,
              y: position.y + delta.y,
            };
            savePosition(newPosition);
          }}
        >
          <div>
            <PomoTimer position={position} />
          </div>
        </DndContext>
      </div>
    </>
  );
};

export default PomodoroContent;
