"use client";

import React, { useEffect, useState } from "react";

import PomoTimerSettings from "../PomoTimerSettings/PomoTimerSettings";

import { useDraggable } from "@dnd-kit/core";
import { PomoTimerProps } from "@/app/utility/types/types";

import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  changeMode,
  updateRemainingTime,
} from "@/app/redux/slices/pomodoroSlice/pomodoroSlice";
import {
  fetchTimerStatus,
  getPomodoroSettings,
  startPomodoro,
  stopPomodoro,
} from "@/app/redux/slices/pomodoroSlice/asyncActions";

import { FaRegWindowMinimize } from "react-icons/fa";
import { FiSettings, FiRefreshCw } from "react-icons/fi";

const PomoTimer: React.FC<PomoTimerProps> = ({
  position,
  setOpenSettings,
  openSettings,
  setIsTimerActive,
}) => {
  const [localPosition, setLocalPosition] = useState(position);
  const [isDragging, setIsDragging] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const { settings, currentPhase, isRunning, remainingTime } = useSelector(
    (state: RootState) => state.pomodoro
  );

  //==============================

  //if i cant fix this fucking shit with useEffect, i can probably just change phases in handleChangeMode, so i need logic at backend to switch phase and just dispatch into handleChangeMode

  //===============================

  //change timer mode
  const handleChangeMode = (mode: "pomodoro" | "shortBreak" | "longBreak") => {
    dispatch(changeMode(mode));
  };

  const handleStart = () => {
    if (!isRunning) {
      dispatch(startPomodoro(currentPhase));
    }
  };

  const handleStop = async () => {
    await dispatch(stopPomodoro());
    dispatch(fetchTimerStatus());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  useEffect(() => {
    // Atjaunināt laiku tikai, ja taimeris nav startēts
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
        dispatch(updateRemainingTime(initialTime)); // Atjaunina tikai tad, kad taimeris nav startēts
      };

      updateInitialTime(); // Pārbaudām režīma maiņu
    }
  }, [
    currentPhase,
    settings.pomodoro,
    settings.shortBreak,
    settings.longBreak,
    dispatch,
    isRunning, // Pārliecināmies, ka tas tiek darīts tikai tad, kad taimeris nav startēts
  ]);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        dispatch(fetchTimerStatus());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [dispatch, isRunning]);

  useEffect(() => {
    dispatch(getPomodoroSettings());
  }, [dispatch]);

  //=====================
  //dnd
  //=====================

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

  // update pos when it changes
  useEffect(() => {
    if (position !== localPosition) {
      setLocalPosition(position);
    }
  }, [position]);

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
          <h1 className="text-5xl font-bold">{formatTime(remainingTime)}</h1>
        </div>

        {/* Buttons Section */}
        <div className="flex m-auto gap-4  ">
          <button
            className="px-8 py-1 bg-transparent border border-white rounded-lg "
            onClick={isRunning ? handleStop : handleStart}
          >
            <span className="font-semibold text-md">
              {isRunning ? "Stop" : "Start"}
            </span>
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
            currentPhase === "pomodoro"
              ? "border-b-2 border-gray-400  pb-1"
              : ""
          }
          onClick={() => handleChangeMode("pomodoro")}
        >
          Pomodoro
        </button>
        <button
          className={
            currentPhase === "shortBreak"
              ? "border-b-2 border-gray-400 pb-1 "
              : ""
          }
          onClick={() => handleChangeMode("shortBreak")}
        >
          Short Break
        </button>

        <button
          className={
            currentPhase === "longBreak"
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
