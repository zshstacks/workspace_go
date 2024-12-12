import React from "react";
import { PiSpeakerHigh } from "react-icons/pi";

const PomoTimerSettings = () => {
  return (
    <div className=" font-medium">
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
              className="w-[100px] rounded-sm py-[3px] px-2 mt-2 text-black text-sm font-normal"
            />
          </div>
          <div>
            <label htmlFor="">Short Break</label>
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={15}
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
        <button className="w-[303px] p-1 rounded-md bg-[#e89688]">Save</button>
      </div>
    </div>
  );
};

export default PomoTimerSettings;
