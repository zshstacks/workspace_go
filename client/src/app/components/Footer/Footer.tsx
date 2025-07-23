import { useToggleState } from "@/app/hooks/useToggleState";
import React, { useContext } from "react";
import { IoIosSend } from "react-icons/io";
import { IoChatbubbleEllipsesOutline, IoCloseOutline } from "react-icons/io5";
import { MyContext } from "../Workspace/Workspace";
import { LuGitPullRequestCreate } from "react-icons/lu";

const Footer = () => {
  const [isActive, setIsActive] = useToggleState(false);

  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "The Footer component should be used within MyContext.Provider."
    );
  }
  const { theme } = context;

  return (
    <div className="w-full flex justify-between items-center fixed left-0 bottom-0 h-[50px] z-[10000]">
      <div className="justify-end flex w-full ">
        <div
          className="bg-main dark:bg-lightMain w-[45px] h-[45px] rounded-md mb-3 mr-2 flex justify-center items-center text-center  cursor-pointer hover:bg-secondary dark:hover:bg-secondary"
          onClick={setIsActive}
        >
          <IoChatbubbleEllipsesOutline
            size={19}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </div>

        {/* Chat block with slide animation */}

        <div
          className={`fixed bottom-16 right-[60px] w-[350px] h-[690px] bg-main bg-transparent rounded-t-lg shadow-md shadow-[0_0_20px_rgba(59,130,246,0.2)]" backdrop-blur-lg rounded-x flex flex-col overflow-y-auto custom-scrollbar transition-transform duration-500 ease-in-out ${
            isActive ? "translate-x-[52px]" : "translate-x-[118%]"
          }`}
        >
          {/* Header */}
          <div className="p-4 flex justify-between items-center ">
            <h3 className="text-white font-medium">Chat</h3>
            <button
              onClick={setIsActive}
              className="text-gray-400 hover:text-white hover:scale-105 transition-all"
            >
              <IoCloseOutline />
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 ">
            <div className="space-y-4">
              {/* Regular message */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-gray-900 ring-orange-500/50">
                  <span className="text-white text-xs font-bold">Z</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white text-sm font-medium">
                      zshstacks
                    </span>
                    <span className="text-gray-400 text-xs">
                      May 26, 6:21pm
                    </span>
                  </div>
                  <p className="text-white text-sm">ggdf</p>
                </div>
              </div>

              {/* Host message */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500/50">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-blue-400 text-sm font-medium">
                      tragicpale
                    </span>

                    <span className="text-gray-400 text-xs">
                      May 26, 6:21pm
                    </span>
                  </div>
                  <p className="text-white text-sm">dasdsad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 gap-y-4 flex flex-col">
            <div className="flex space-x-2">
              <textarea
                rows={1}
                maxLength={85}
                autoComplete="off"
                placeholder="Say something"
                className="flex-1 bg-main dark:bg-lightMain dark:placeholder:text-lightText text-white dark:text-lightText rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700/50 dark:focus:ring-lightBorder placeholder-gray-400 resize-none"
              />
              <button
                className="bg-main dark:bg-lightMain text-white px-4 py-2 rounded-lg dark:hover:bg-secondary hover:bg-secondary hover:shadow-[0_0_10px_rgba(232,150,136,0.5)] transition-all"
                title="Send"
              >
                <IoIosSend color={theme === "dark" ? "#4e4e4e" : "white"} />
              </button>
            </div>
            {/* uniqueID input */}
            <div className="flex space-x-2 justify-center">
              <input
                maxLength={12}
                autoComplete="off"
                placeholder="Enter user unique #ID"
                className=" w-48 bg-main dark:bg-lightMain dark:placeholder:text-lightText text-white dark:text-lightText rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700/50 dark:focus:ring-lightBorder placeholder-gray-400 "
              />
              <button
                className="bg-main dark:bg-lightMain text-white px-4 py-2 rounded-lg dark:hover:bg-secondary hover:bg-secondary hover:shadow-[0_0_10px_rgba(232,150,136,0.5)] transition-all"
                title="Create chat hub"
              >
                <LuGitPullRequestCreate
                  color={theme === "dark" ? "#4e4e4e" : "white"}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
