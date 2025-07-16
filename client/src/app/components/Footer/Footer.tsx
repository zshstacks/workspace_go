import { useToggleState } from "@/app/hooks/useToggleState";
import React from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

const Footer = () => {
  const [isActive, setIsActive] = useToggleState(false);

  return (
    <div className="w-full flex justify-between items-center fixed left-0 bottom-0 h-[50px]">
      <div className="justify-end flex w-full">
        <div
          className="bg-main w-[45px] h-[45px] rounded-md mb-3 mr-2 flex justify-center items-center text-center text-white cursor-pointer hover:bg-neutral-700"
          onClick={setIsActive}
        >
          <IoChatbubbleEllipsesOutline size={19} />
        </div>

        {/* Chat block with slide animation */}
        <div
          className={`fixed bottom-16 right-[60px] w-[350px] h-[700px] bg-main rounded-t-lg shadow-2xl border border-gray-700 flex flex-col overflow-hidden transition-transform duration-500 ease-in-out ${
            isActive ? "translate-x-[52px]" : "translate-x-[118%]"
          }`}
        >
          {/* Header */}
          <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="text-white font-medium">Chat</h3>
            <button
              onClick={setIsActive}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-main">
            {/* Regular messages */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Z</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white text-sm font-medium">
                      zahstacks
                    </span>
                    <span className="text-gray-400 text-xs">
                      May 26, 6:21pm
                    </span>
                  </div>
                  <p className="text-white text-sm">ggdf</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-blue-400 text-sm font-medium">
                      tragicpale
                    </span>
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Host
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
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Say something"
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
