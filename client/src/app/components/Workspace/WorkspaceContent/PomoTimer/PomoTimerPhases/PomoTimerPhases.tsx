import { changePhase } from "@/app/redux/slices/pomodoroSlice/asyncActions";
import { changeMode } from "@/app/redux/slices/pomodoroSlice/pomodoroSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import { PomoTimerPhasesProps } from "@/app/utility/types/types";
import { MyContext } from "../../../Workspace";
import React, { useCallback, useContext } from "react";

import { FiSettings } from "react-icons/fi";

const PomoTimerPhases: React.FC<PomoTimerPhasesProps> = ({
  setOpenSettings,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { currentPhase } = useSelector((state: RootState) => state.pomodoro);

  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "The PomoTimer component should be used within MyContext.Provider."
    );
  }
  const { theme } = context;

  // Timer mode switch
  const handleChangeMode = useCallback(
    async (mode: string) => {
      if (
        mode === "pomodoro" ||
        mode === "shortBreak" ||
        mode === "longBreak"
      ) {
        await dispatch(changePhase(mode));
        dispatch(changeMode(mode));
      }
    },
    [dispatch]
  );

  return (
    <div className="flex justify-around mt-6 text-sm">
      <button
        className={
          currentPhase === "pomodoro"
            ? "border-b-2 border-gray-400 dark:border-lightBorder pb-1"
            : ""
        }
        onClick={() => handleChangeMode("pomodoro")}
      >
        <span className="dark:text-lightText">Pomodoro</span>
      </button>
      <button
        className={
          currentPhase === "shortBreak"
            ? "border-b-2 border-gray-400 dark:border-lightBorder pb-1"
            : ""
        }
        onClick={() => handleChangeMode("shortBreak")}
      >
        <span className="dark:text-lightText">Short break</span>
      </button>
      <button
        className={
          currentPhase === "longBreak"
            ? "border-b-2 border-gray-400 dark:border-lightBorder pb-1"
            : ""
        }
        onClick={() => handleChangeMode("longBreak")}
      >
        <span className="dark:text-lightText">Long break</span>
      </button>

      {/* Settings */}
      <div className="flex">
        <button onClick={setOpenSettings}>
          <FiSettings
            color={theme === "dark" ? "#4e4e4e" : "white"}
            size={20}
          />
        </button>
      </div>
    </div>
  );
};

export default PomoTimerPhases;
