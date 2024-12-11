import React from "react";
import { BsFire } from "react-icons/bs";
import { LuUserRound } from "react-icons/lu";
import { MdCloseFullscreen, MdOutlineKeyboardArrowDown } from "react-icons/md";

const Header = () => {
  return (
    <header className="w-full p-2 flex justify-between items-center fixed ">
      {/* Left Section */}
      <div className="flex items-center  ">
        <div className="bg-header rounded-md px-2 py-1 flex justify-center items-center ">
          <div className="flex hover:bg-gray-700 hover:rounded-md px-1  cursor-pointer">
            <span className="text-white text-md mr-1">2</span>
            <BsFire color="darkorange" size={19} />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center bg-header rounded-md text-white p-1">
        <div className="hover:bg-gray-700 p-1 hover:rounded-md cursor-pointer">
          <MdCloseFullscreen size={19} className="mr-[2px]" />
        </div>

        <div className="h-5 w-[1px] bg-gray-500 mx-2"></div>

        <div className="flex items-center   p-1 hover:bg-gray-700 hover:rounded-md  cursor-pointer">
          <LuUserRound size={19} className="mr-[2px]" />
          <MdOutlineKeyboardArrowDown size={18} />
        </div>
      </div>
    </header>
  );
};

export default Header;
