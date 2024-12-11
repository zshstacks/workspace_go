import React from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { FiSettings, FiRefreshCw } from "react-icons/fi";

const PomoTimer = () => {
  return (
    <div className="bg-main  text-white w-[360px] p-4 rounded-lg shadow-md">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
        <button className="text-gray-400  pb-2">
          <FaRegWindowMinimize size={14} />
        </button>
      </div>

      {/* Timer Section */}
      <div className="flex justify-center ">
        <div className="w-full">
          <h1 className="text-5xl font-bold">60:00</h1>
        </div>

        {/* Buttons Section */}
        <div className="flex justify-center gap-4  ">
          <button className="px-8 bg-transparent border border-white rounded-lg  ">
            <span className="font-bold text-sm">Start</span>
          </button>
          <button className="">
            <FiRefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex justify-around mt-6 text-sm">
        <button className="border-b-2 border-white pb-1 font-medium">
          Pomodoro
        </button>
        <button className="hover:text-gray-300">Short Break</button>
        <button className="hover:text-gray-300">Long Break</button>

        {/* Settings Icon */}
        <div className="flex">
          <button className="hover:text-gray-300">
            <FiSettings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomoTimer;
