import { useToggleState } from "@/app/hooks/useToggleState";
import { useChat } from "@/app/hooks/useChat";
import React, { useContext, useState, useRef, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { IoChatbubbleEllipsesOutline, IoCloseOutline } from "react-icons/io5";
import { LuGitPullRequestCreate } from "react-icons/lu";
import { MyContext } from "../Workspace/Workspace";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux/store";
import { validateUser } from "@/app/redux/slices/userSlice/asyncActions";

const Footer = () => {
  const [isActive, setIsActive] = useToggleState(false);
  const [messageText, setMessageText] = useState("");
  const [targetUserID, setTargetUserID] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context = useContext(MyContext);
  if (!context) {
    throw new Error(
      "The Footer component should be used within MyContext.Provider."
    );
  }
  const { theme } = context;

  // Get current user from user state
  const currentUser = useSelector((state: RootState) => state.user.user);
  const dispatch: AppDispatch = useDispatch();

  // Use chat hook
  const {
    activeRoom,
    isConnecting,
    isConnected,
    error,
    connectToUserChat,
    sendChatMessage,
    disconnectChat,
    updateTargetUserID,
    clearChatError,
  } = useChat();

  //validate user
  useEffect(() => {
    dispatch(validateUser());
  }, [dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeRoom?.messages]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearChatError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearChatError]);

  const handleCreateChatRoom = () => {
    if (!currentUser?.uniqueID) {
      alert("User not authenticated");
      return;
    }

    if (!targetUserID.trim()) {
      alert("Please enter target user ID");
      return;
    }

    if (targetUserID === currentUser.uniqueID) {
      alert("Cannot chat with yourself");
      return;
    }

    // Connect to chat room
    connectToUserChat(currentUser.uniqueID, targetUserID.trim());
    updateTargetUserID(targetUserID.trim());
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendChatMessage(messageText.trim());
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDisconnect = () => {
    disconnectChat();
    setTargetUserID("");
    setMessageText("");
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getUserDisplayName = (userID: string) => {
    return userID;
  };

  return (
    <div className="w-full flex justify-between items-center fixed left-0 bottom-0 h-[50px] z-[10000]">
      <div className="justify-end flex w-full ">
        <div
          className="bg-main dark:bg-lightMain w-[45px] h-[45px] rounded-md mb-3 mr-2 flex justify-center items-center text-center cursor-pointer hover:bg-secondary dark:hover:bg-secondary"
          onClick={setIsActive}
        >
          <IoChatbubbleEllipsesOutline
            size={19}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
          {isConnected && (
            <div className="absolute -top-2 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>

        {/* Chat block with slide animation */}
        <div
          className={`fixed bottom-16 right-[60px] w-[350px] h-[690px] bg-main bg-transparent rounded-t-lg  backdrop-blur-lg rounded-x flex flex-col overflow-hidden transition-transform duration-500 ease-in-out ${
            isActive ? "translate-x-[52px]" : "translate-x-[118%]"
          }`}
        >
          {/* Header */}
          <div className="p-4 flex justify-between items-center border-b border-gray-500">
            <div>
              <h3 className="text-white font-medium">Chat</h3>
              {isConnected && activeRoom && (
                <p className="text-xs text-green-400">
                  Connected with{" "}
                  {getUserDisplayName(
                    activeRoom.participantB === currentUser?.uniqueID
                      ? activeRoom.participantA
                      : activeRoom.participantB
                  )}
                </p>
              )}
              {isConnecting && (
                <p className="text-xs text-yellow-400">Connecting...</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-400/20 transition-all"
                >
                  Disconnect
                </button>
              )}
              <button
                onClick={setIsActive}
                className="text-gray-400 hover:text-white hover:scale-105 transition-all"
              >
                <IoCloseOutline />
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-500/20 border-l-4 border-red-500 mx-4 mt-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Chat messages area */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {!isConnected && !isConnecting ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-center">
                  Enter a user ID below to start chatting
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRoom?.messages.map((message, index) => {
                  const isOwnMessage =
                    message.senderID === currentUser?.uniqueID;
                  const isSystemMessage = message.senderID === "system";

                  return (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${
                        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-offset-gray-900 ${
                          isSystemMessage
                            ? "bg-gray-600 ring-gray-500/50"
                            : isOwnMessage
                            ? "bg-blue-500 ring-blue-500/50"
                            : "bg-orange-500 ring-orange-500/50"
                        }`}
                      >
                        <span className="text-white text-xs font-bold">
                          {isSystemMessage
                            ? "S"
                            : getUserDisplayName(message.senderID)
                                .charAt(0)
                                .toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div
                          className={`flex items-center space-x-2 mb-1 ${
                            isOwnMessage
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          <span
                            className={`text-sm font-medium ${
                              isSystemMessage
                                ? "text-gray-400"
                                : isOwnMessage
                                ? "text-blue-400"
                                : "text-orange-400"
                            }`}
                          >
                            {isSystemMessage
                              ? "System"
                              : getUserDisplayName(message.senderID)}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`text-white text-sm ${
                            isOwnMessage ? "text-right" : ""
                          }`}
                        >
                          {message.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 gap-y-4 flex flex-col border-t border-gray-500">
            {/* Message input - only show when connected */}
            {isConnected && (
              <div className="flex space-x-2">
                <textarea
                  rows={1}
                  maxLength={500}
                  autoComplete="off"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-main dark:bg-lightMain dark:placeholder:text-lightText text-white dark:text-lightText rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700/50 dark:focus:ring-lightBorder placeholder-gray-400 resize-none"
                  disabled={!isConnected}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !isConnected}
                  className="bg-main dark:bg-lightMain text-white px-4 py-2 rounded-lg dark:hover:bg-secondary hover:bg-secondary hover:shadow-[0_0_10px_rgba(232,150,136,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <IoIosSend color={theme === "dark" ? "#4e4e4e" : "white"} />
                </button>
              </div>
            )}

            {/* User ID input - only show when not connected */}
            {!isConnected && (
              <div className="flex space-x-2 justify-center">
                <input
                  maxLength={12}
                  minLength={8}
                  autoComplete="off"
                  placeholder="Enter user unique #ID"
                  value={targetUserID}
                  onChange={(e) => setTargetUserID(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleCreateChatRoom()
                  }
                  className="w-48 bg-main dark:bg-lightMain dark:placeholder:text-lightText text-white dark:text-lightText rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-700/50 dark:focus:ring-lightBorder placeholder-gray-400"
                  disabled={isConnecting}
                />
                <button
                  onClick={handleCreateChatRoom}
                  disabled={isConnecting || !targetUserID.trim()}
                  className="bg-main dark:bg-lightMain text-white px-4 py-2 rounded-lg dark:hover:bg-secondary hover:bg-secondary hover:shadow-[0_0_10px_rgba(232,150,136,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Create chat room"
                >
                  <LuGitPullRequestCreate
                    color={theme === "dark" ? "#4e4e4e" : "white"}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
