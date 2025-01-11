import {
  getPomodoroSettings,
  updatePomodoroTime,
} from "@/app/redux/slices/pomodoroSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useState } from "react";
import { PiSpeakerHigh } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";

const PomoTimerSettings = () => {
  const dispatch: AppDispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.pomodoro.settings);

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    dispatch(updatePomodoroTime(localSettings)).then(() => {
      dispatch(getPomodoroSettings());
    });
  };

  return (
    <div className=" font-medium " id="pomo-timer">
      {/* divider */}
      <div className="w-full h-[1px] bg-black/35 my-5"></div>

      {/* count and transition settings */}
      <div className="flex flex-col gap-2">
        <div className="gap-2 flex ">
          <input type="checkbox" id="trans_timer" className="w-4 " />
          <label htmlFor="trans_timer">Auto-transition Timer</label>
        </div>
        <div className="gap-2 flex">
          <input type="checkbox" id="count_timer" className="w-4 " />
          <label htmlFor="count_timer">Hide Pomodoro Count</label>
        </div>
      </div>
      {/* divider */}
      <div className="w-full h-[1px] bg-black/35 my-5"></div>

      {/* pomodoro timer settings*/}
      <>
        {/* set time on pomo and breaks */}
        <div className="flex justify-center text-start gap-4">
          <div className="">
            <label htmlFor="" className="">
              Pomodoro
            </label>
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={60}
              value={localSettings.pomodoro}
              className="w-[100px] rounded-sm py-[3px] px-2 mt-2 text-black text-sm font-normal"
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
            <label htmlFor="">Short Break</label>
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
              className="w-[100px] rounded-sm mt-2 py-[3px] px-2 text-black text-sm font-normal"
            />
          </div>
          <div>
            <label htmlFor="">Long Break</label>
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
              className="w-[100px] rounded-sm mt-2 py-[3px] px-2 text-black text-sm font-normal"
            />
          </div>
        </div>
        {/* choose sound */}
        <div className="flex ">
          <div className="flex gap-[22px] mt-5">
            <label htmlFor="" className="m-auto ">
              Timer Sound
            </label>

            <select
              name=""
              id=""
              className="w-[207px] bg-[#3d3e42] py-1 px-2 text-sm cursor-pointer focus:outline-none "
            >
              <option value="twinkle">Twinkle</option>
              <option value="playtime">Playtime</option>
              <option value="sci-fi">Sci Fi</option>
              <option value="slow-rise">Slow Rise</option>
              <option value="rooster">Rooster</option>
              <option value="bird">Bird</option>
            </select>
          </div>
        </div>

        {/* volume input */}

        <div className="flex my-4 gap-4">
          <label htmlFor="">
            <PiSpeakerHigh size={23} />
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
