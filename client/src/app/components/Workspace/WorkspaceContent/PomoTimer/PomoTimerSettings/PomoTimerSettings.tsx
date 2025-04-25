import {
  getPomodoroSettings,
  updateAutoTransition,
  updatePomodoroTime,
} from "@/app/redux/slices/pomodoroSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { PiSpeakerHigh } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { MyContext } from "../../../Workspace";
import { PomoTimerSettingsProps } from "@/app/utility/types/componentTypes";

const PomoTimerSettings: React.FC<PomoTimerSettingsProps> = ({
  setIsHideCount,
  ishideCount,
  setVolume,
  volume,
  setTimerSound,
}) => {
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

  const handleSave = useCallback(() => {
    dispatch(updatePomodoroTime(localSettings)).then(() => {
      dispatch(getPomodoroSettings());
    });
  }, [dispatch, localSettings]);

  //handle input change
  const handleInputChange = useCallback((field: string, value: number) => {
    setLocalSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  //transition timer change
  const handleAutoTransitionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.checked;
      setLocalSettings((prev) => ({
        ...prev,
        autoTransition: newValue,
      }));
      dispatch(updateAutoTransition(newValue));
    },
    [dispatch]
  );

  //handle timer sound selection
  const handleSoundChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSound = e.target.value;
      setTimerSound(newSound);
    },
    [setTimerSound]
  );

  //handle volume change
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    },
    [setVolume]
  );

  useEffect(() => {
    setLocalSettings({
      pomodoro: settings.pomodoro || 25,
      shortBreak: settings.shortBreak || 5,
      longBreak: settings.longBreak || 15,
      autoTransition: settings.autoTransitionEnabled,
    });
  }, [settings]);

  //render time inputs with validation
  const renderTimeInput = (
    field: "pomodoro" | "shortBreak" | "longBreak",
    label: string,
    defaultValue: number
  ) => {
    return (
      <div>
        <label htmlFor={field} className="dark:text-lightText">
          {label}
        </label>
        <input
          id={field}
          type="number"
          min={1}
          max={60}
          value={localSettings[field]}
          className="w-[100px] rounded-sm py-[3px] px-2 mt-2 text-black dark:text-lightText text-sm font-normal"
          onChange={(e) => {
            const target = e.target as HTMLInputElement;
            let value = target.value;

            //max 2 num
            if (value.length > 2) {
              value = value.slice(0, 2);
            }
            const numValue =
              value === "" ? defaultValue : Math.min(parseInt(value), 60);

            handleInputChange(field, numValue);
          }}
        />
      </div>
    );
  };

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
          <input
            type="checkbox"
            id="count_timer"
            className="w-4 "
            checked={ishideCount}
            onChange={setIsHideCount}
          />
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
          {renderTimeInput("pomodoro", "Pomodoro", 25)}
          {renderTimeInput("shortBreak", "Short Break", 5)}
          {renderTimeInput("longBreak", "Long Break", 10)}
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
              onChange={handleSoundChange}
              className="w-[207px] bg-[#3d3e42] dark:bg-[#d3d1d1] dark:text-lightText py-1 px-2 text-sm cursor-pointer focus:outline-none "
            >
              <option
                value={process.env.NEXT_PUBLIC_ALARM_AUDIO}
                className="dark:text-lightText"
              >
                Alarm digital
              </option>
              <option
                value={process.env.NEXT_PUBLIC_TWINKLE_AUDIO}
                className="dark:text-lightText"
              >
                Twinkle
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
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-[2px] m-auto bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-400 hover:accent-gray-300"
          />
        </div>
      </>
      {/* save settings */}
      <div className="flex justify-center mt-5 mb-3">
        <button
          className="w-[303px] p-1 rounded-md bg-secondary"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PomoTimerSettings;
