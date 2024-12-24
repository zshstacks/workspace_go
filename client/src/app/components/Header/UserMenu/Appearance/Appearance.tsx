import { AppearanceProps } from "@/app/utility/types/types";
import React from "react";
import { IoIosClose } from "react-icons/io";
import { RiMoonLine } from "react-icons/ri";

const Appearance: React.FC<AppearanceProps> = ({
  openUISettings,
  openAppearance,
}) => {
  return (
    <>
      {openUISettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999] ">
          <div className="w-96  bg-main rounded-lg shadow-lg">
            <div
              className=" flex justify-end relative cursor-pointer"
              onClick={openAppearance}
            >
              <IoIosClose color="white" size={22} />
            </div>
            <div className="py-1 px-7">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-100">
                  Appearance Settings
                </h2>
              </div>
              <div className="flex flex-col gap-3 mb-10">
                <h5 className="text-gray-500 text-[12px]">THEME</h5>
                <div className="flex justify-between ">
                  <span className="text-gray-100 text-sm font-semibold my-auto">
                    Dark Mode
                  </span>
                  <button className="w-12 h-8 border border-gray-500 rounded-md  flex justify-center ">
                    <RiMoonLine size={22} color="white" className="my-auto" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 mb-10">
                <h5 className="text-gray-500 text-[12px]">FOCUS MODE</h5>
                <div className="flex justify-between">
                  <span className="text-gray-100 text-sm font-semibold">
                    Hide Elements
                  </span>
                  <input
                    type="checkbox"
                    name=""
                    id=""
                    className="w-5 h-5 appearance-none bg-main border border-gray-600 rounded-sm hover:bg-white/5 focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-100 text-sm font-semibold my-auto">
                    Hide After(seconds)
                  </span>
                  <input
                    type="number"
                    className="w-16 h-8 bg-main text-gray-100 text-sm font-semibold border border-gray-600 rounded-md px-[10px] focus:outline-none focus:ring-1 focus:ring-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    defaultValue={30}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Appearance;
