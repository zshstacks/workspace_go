"use client";

import React, { useEffect, useState } from "react";
import Header from "../../Header/Header";
import PomoTimer from "./PomoTimer/PomoTimer";
import { DndContext, Modifier } from "@dnd-kit/core";
import { Position } from "@/app/utility/types/types";
import Appearance from "../../Header/UserMenu/Appearance/Appearance";
import UserAccount from "../../Header/UserMenu/UserAccount/UserAccount";
import Link from "next/link";

const restrictToBoundingBox: Modifier = ({
  transform,
  activeNodeRect,
  containerNodeRect,
}) => {
  if (!activeNodeRect || !containerNodeRect) {
    return transform;
  }

  const boundingBox = {
    top: 60, // top y cord
    bottom: 830, // bott y cord
    left: 16, // left x cord
    right: 1846, // right x cord
  };

  let newX = transform.x;
  let newY = transform.y;

  const adjustedX = activeNodeRect.left + transform.x;
  const adjustedY = activeNodeRect.top + transform.y;

  if (adjustedX < boundingBox.left) {
    newX = boundingBox.left - activeNodeRect.left;
  } else if (adjustedX + activeNodeRect.width > boundingBox.right) {
    newX = boundingBox.right - (activeNodeRect.left + activeNodeRect.width);
  }

  if (adjustedY < boundingBox.top) {
    newY = boundingBox.top - activeNodeRect.top;
  } else if (adjustedY + activeNodeRect.height > boundingBox.bottom) {
    newY = boundingBox.bottom - (activeNodeRect.top + activeNodeRect.height);
  }

  return {
    ...transform, // saving scaleX & scaleY
    x: newX,
    y: newY,
  };
};

const localStorageKey =
  process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || "widgetPosition";

const PomodoroContent = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [openUISettings, setOpenUISettings] = useState(false);
  const [openAccSettings, setOpenAccSettings] = useState(false);

  const openAppearance = () => {
    setOpenUISettings(!openUISettings);
  };

  const openAccountSettings = () => {
    setOpenAccSettings(!openAccSettings);
  };

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
          openAppearance={openAppearance}
          openAccountSettings={openAccountSettings}
        />

        <div
          className="w-[15px] h-[10px]  absolute right-1/2 cursor-pointer  "
          onClick={resetPos}
        >
          <span color="red" className=" border-2 bg-red-300 ">
            resetPos
          </span>
        </div>
        <div className="w-[15px] h-[10px]  absolute right-[55%] cursor-pointer ">
          <span className="border-2 bg-red-300">
            <Link href="/signin">Auth</Link>
          </span>
        </div>
      </div>
      {openUISettings && (
        <Appearance
          openUISettings={openUISettings}
          openAppearance={openAppearance}
        />
      )}

      {openAccSettings && (
        <UserAccount
          openAccountSettings={openAccountSettings}
          openAccSettings={openAccSettings}
        />
      )}

      {/* timer */}
      <DndContext
        modifiers={[restrictToBoundingBox]}
        onDragEnd={(event) => {
          const { delta } = event;
          const newPosition = {
            x: position.x + delta.x,
            y: position.y + delta.y,
          };
          savePosition(newPosition);
        }}
      >
        <PomoTimer position={position} />
      </DndContext>
    </>
  );
};

export default PomodoroContent;
