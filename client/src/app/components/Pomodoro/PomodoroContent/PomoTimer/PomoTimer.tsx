"use client";

import React, { useEffect, useState } from "react";

import PomoTimerSettings from "../PomoTimerSettings/PomoTimerSettings";

import { useDraggable } from "@dnd-kit/core";
import { PomoTimerProps } from "@/app/utility/types/types";

import { FaRegWindowMinimize } from "react-icons/fa";
import { FiSettings, FiRefreshCw } from "react-icons/fi";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { changeMode } from "@/app/redux/slices/pomodoroSlice/pomodoroSlice";
import { getPomodoroSettings } from "@/app/redux/slices/pomodoroSlice/asyncActions";

const PomoTimer: React.FC<PomoTimerProps> = ({
  position,
  setOpenSettings,
  openSettings,
  setIsTimerActive,
}) => {
  // const [openSettings, setOpenSettings] = useState(false);
  const [localPosition, setLocalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const { settings, currentMode } = useSelector(
    (state: RootState) => state.pomodoro
  );

  //change timer mode
  const handleChangeMode = (mode: "pomodoro" | "shortBreak" | "longBreak") => {
    dispatch(changeMode(mode));
  };

  useEffect(() => {
    // Pieprasām iestatījumus no servera pēc komponentes ielādes
    dispatch(getPomodoroSettings());
  }, [dispatch]);

  //fetch duration based on type
  const getCurrentDuration = () => {
    if (currentMode === "pomodoro") return settings.pomodoro;
    if (currentMode === "shortBreak") return settings.shortBreak;
    if (currentMode === "longBreak") return settings.longBreak;
    return 0;
  };

  // update pos when it changes
  useEffect(() => {
    if (position !== localPosition) {
      setLocalPosition(position);
    }
  }, [position]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dragging,
  } = useDraggable({
    id: "pomo-timer",
  });

  useEffect(() => {
    if (transform) {
      setLocalPosition({
        x: position.x + transform.x,
        y: position.y + transform.y,
      });
    }
  }, [transform, position]);

  useEffect(() => {
    setIsDragging(dragging);
  }, [dragging]);

  return (
    <div
      className={`bg-main text-white w-[360px] p-4 rounded-lg shadow-md `}
      style={{
        transform: `translate3d(${localPosition.x}px, ${localPosition.y}px, 0)`,
        position: "fixed",
      }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2 ">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>

        {/* div for dnd  */}
        <div
          className="w-[270px] h-[40px] absolute"
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        ></div>

        <button className="text-gray-400  pb-2" onClick={setIsTimerActive}>
          <FaRegWindowMinimize size={14} />
        </button>
      </div>

      {/* divider */}
      <div className="w-[360px] h-[1px] bg-white/25 absolute right-0"></div>

      {/* Timer Section */}
      <div className="flex justify-center mt-6">
        <div className="w-full">
          <h1 className="text-5xl font-bold">{getCurrentDuration()}:00</h1>
        </div>

        {/* Buttons Section */}
        <div className="flex m-auto gap-4  ">
          <button className="px-8 py-1 bg-transparent border border-white rounded-lg ">
            <span className="font-semibold text-md">Start</span>
          </button>
          <button className="">
            <FiRefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex justify-around mt-6 text-sm ">
        <button
          className={
            currentMode === "pomodoro" ? "border-b-2 border-gray-400  pb-1" : ""
          }
          onClick={() => handleChangeMode("pomodoro")}
        >
          Pomodoro
        </button>
        <button
          className={
            currentMode === "shortBreak"
              ? "border-b-2 border-gray-400 pb-1 "
              : ""
          }
          onClick={() => handleChangeMode("shortBreak")}
        >
          Short Break
        </button>

        <button
          className={
            currentMode === "longBreak"
              ? "border-b-2 border-gray-400 pb-1 "
              : ""
          }
          onClick={() => handleChangeMode("longBreak")}
        >
          Long Break
        </button>

        {/* Settings Icon */}
        <div className="flex">
          <button onClick={setOpenSettings}>
            <FiSettings size={20} />
          </button>
        </div>
      </div>

      {openSettings && <PomoTimerSettings />}
    </div>
  );
};

export default PomoTimer;
