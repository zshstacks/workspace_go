import {
  getPomodoroSettings,
  updateAutoTransition,
  updatePomodoroTime,
} from "@/app/redux/slices/pomodoroSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useContext, useEffect, useState } from "react";
import { PiSpeakerHigh } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { MyContext } from "../../Pomodoro";

const PomoTimerSettings = () => {
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.pomodoro.settings);

  const [localSettings, setLocalSettings] = useState({
    pomodoro: settings.pomodoro,
    shortBreak: settings.shortBreak,
    longBreak: settings.longBreak,
    autoTransition: settings.autoTransitionEnabled,
  });

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The PomoTimerSettings component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  const handleSave = () => {
    dispatch(updatePomodoroTime(localSettings)).then(() => {
      dispatch(getPomodoroSettings());
    });
  };

  //transition timer change
  const handleAutoTransitionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.checked;
    setLocalSettings({
      ...localSettings,
      autoTransition: newValue,
    });
    dispatch(updateAutoTransition(newValue));
  };

  useEffect(() => {
    setLocalSettings({
      pomodoro: settings.pomodoro,
      shortBreak: settings.shortBreak,
      longBreak: settings.longBreak,
      autoTransition: settings.autoTransitionEnabled,
    });
  }, [settings]);

  return (
    <div className=" font-medium " id="pomo-timer">
      {/* divider */}
      <div className="w-full h-[1px] bg-black/35 dark:bg-lightBorder my-5"></div>

      {/* count and transition settings */}
      <div className="flex flex-col gap-2">
        <div className="gap-2 flex ">
          <input
            type="checkbox"
            id="trans_timer"
            checked={localSettings.autoTransition}
            onChange={handleAutoTransitionChange}
            className="w-4 "
          />
          <label htmlFor="trans_timer" className="dark:text-lightText">
            Auto-transition Timer
          </label>
        </div>
        <div className="gap-2 flex">
          <input type="checkbox" id="count_timer" className="w-4 " />
          <label htmlFor="count_timer" className="dark:text-lightText">
            Hide Pomodoro Count
          </label>
        </div>
      </div>
      {/* divider */}
      <div className="w-full h-[1px] bg-black/35 dark:bg-lightBorder my-5"></div>

      {/* pomodoro timer settings*/}
      <>
        {/* set time on pomo and breaks */}
        <div className="flex justify-center text-start gap-4">
          <div className="">
            <label htmlFor="" className="dark:text-lightText">
              Pomodoro
            </label>
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={60}
              value={localSettings.pomodoro}
              className="w-[100px] rounded-sm py-[3px] px-2 mt-2 text-black dark:text-lightText text-sm font-normal"
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.value.length > 2) {
                  target.value = target.value.slice(0, 2);
                }

                setLocalSettings({
                  ...localSettings,
                  pomodoro: +e.target.value,
                });
              }}
            />
          </div>
          <div>
            <label htmlFor="" className="dark:text-lightText">
              Short Break
            </label>
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={15}
              value={localSettings.shortBreak}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.value.length > 2) {
                  target.value = target.value.slice(0, 2);
                }

                setLocalSettings({
                  ...localSettings,
                  shortBreak: +e.target.value,
                });
              }}
              className="w-[100px] rounded-sm mt-2 py-[3px] px-2 text-black dark:text-lightText text-sm font-normal"
            />
          </div>
          <div>
            <label htmlFor="" className="dark:text-lightText">
              Long Break
            </label>
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={30}
              value={localSettings.longBreak}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.value.length > 2) {
                  target.value = target.value.slice(0, 2);
                }

                setLocalSettings({
                  ...localSettings,
                  longBreak: +e.target.value,
                });
              }}
              className="w-[100px] rounded-sm mt-2 py-[3px] px-2 text-black dark:text-text text-sm font-normal"
            />
          </div>
        </div>
        {/* choose sound */}
        <div className="flex ">
          <div className="flex gap-[22px] mt-5">
            <label htmlFor="" className="m-auto dark:text-lightText ">
              Timer Sound
            </label>

            <select
              name=""
              id=""
              className="w-[207px] bg-[#3d3e42] dark:bg-[#d3d1d1] dark:text-lightText py-1 px-2 text-sm cursor-pointer focus:outline-none "
            >
              <option value="twinkle" className="dark:text-lightText">
                Twinkle
              </option>
              <option value="playtime" className="dark:text-lightText">
                Playtime
              </option>
              <option value="sci-fi" className="dark:text-lightText">
                Sci Fi
              </option>
              <option value="slow-rise" className="dark:text-lightText">
                Slow Rise
              </option>
              <option value="rooster" className="dark:text-lightText">
                Rooster
              </option>
              <option value="bird" className="dark:text-lightText">
                Bird
              </option>
            </select>
          </div>
        </div>

        {/* volume input */}

        <div className="flex my-4 gap-4">
          <label htmlFor="">
            <PiSpeakerHigh
              color={theme === "dark" ? "#4e4e4e" : "white"}
              size={23}
            />
          </label>
          <input
            id="volume"
            type="range"
            className="w-full h-[2px] m-auto bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-gray-300"
          />
        </div>
      </>
      {/* save settings */}
      <div className="flex justify-center mt-5 mb-3">
        <button
          className="w-[303px] p-1 rounded-md bg-[#e89688]"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PomoTimerSettings;
