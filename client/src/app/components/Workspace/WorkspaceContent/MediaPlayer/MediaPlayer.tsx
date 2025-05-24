import { MediaProps } from "@/app/utility/types/componentTypes";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";
import { useDraggable } from "@dnd-kit/core";
import MediaContent from "./MediaContent/MediaContent";

const MEDIA_KEY = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_MEDIA as string;

const MediaPlayer: React.FC<MediaProps> = ({
  widgetInfo,
  activeWidget,
  setDimensionsMedia,
  dimensionsMedia,
  setActiveWidget,
  setIsMediaActive,
  opacity,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Task component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  useEffect(() => {
    const saved = localStorage.getItem(MEDIA_KEY);
    if (saved) setYoutubeUrl(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem(MEDIA_KEY, youtubeUrl);
  };

  //=====================
  // DnD logic
  //=====================

  const staticPosition = widgetInfo ? widgetInfo : { xPos: 0, yPos: 0 };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dragging,
  } = useDraggable({
    id: "media-widget",
  });

  useEffect(() => {
    setIsDragging(dragging);
  }, [dragging]);

  const dynamicPosition = transform
    ? { x: transform.x, y: transform.y }
    : { x: 0, y: 0 };

  const combinedPosition = {
    xPos: staticPosition.xPos + dynamicPosition.x,
    yPos: staticPosition.yPos + dynamicPosition.y,
  };

  //=====================
  // resize logic
  //=====================
  const minWidth = 300;
  const minHeight = 300;
  const maxWidth = 1150;
  const maxHeight = 750;

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = dimensionsMedia.width;
      const startHeight = dimensionsMedia.height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        let newWidth = startWidth + deltaX;
        let newHeight = startHeight + deltaY;

        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;

        setDimensionsMedia({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [dimensionsMedia.width, dimensionsMedia.height, setDimensionsMedia]
  );

  return (
    <div
      onMouseDown={() => setActiveWidget("media")}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-md shadow-white/5 dark:shadow-black/30 flex-1 flex flex-col"
      style={{
        opacity: opacity,
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
        width: dimensionsMedia.width,
        height: dimensionsMedia.height,
        zIndex: activeWidget === "media" ? 100 : 50,
      }}
    >
      {/* header */}
      <div className="flex justify-between p-2">
        <div className="">
          <span className="w-21 flex font-semibold">Media</span>
        </div>

        {/* div for dnd  */}
        <div
          className=" w-full h-[30px] flex "
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        ></div>

        {/* minimize btn */}
        <button
          className="text-gray-400 dark:text-lightText mr-1 pb-2 pl-2"
          onClick={setIsMediaActive}
        >
          <FaRegWindowMinimize
            size={14}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </button>
      </div>

      {/* divider */}
      <div className="w-full h-[1px] bg-white/25 dark:bg-lightBorder "></div>

      {/* content */}
      <div className="flex-1 overflow-hidden">
        <MediaContent youtubeUrl={youtubeUrl} />
      </div>

      {/* footer */}
      <div className="mt-auto items-center h-10 flex justify-center">
        {/* link input */}

        <div className="flex gap-2 justify-center w-full">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter Youtube URL here"
            className="appearance-none focus:appearance-none size-6 bg-main dark:bg-lightMain border border-white/25 dark:border-lightBorder  rounded-lg w-1/2 px-2"
          />
          <button className="font-semibold" onClick={handleSave}>
            Save
          </button>
        </div>

        {/* resize  icon */}
        <div
          className="absolute right-0 bottom-0"
          onMouseDown={handleMouseDown}
        >
          <div className="">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className=" cursor-se-resize fill-white dark:fill-black"
            >
              <path d="M5.333 11.333a.667.667 0 100-1.333.667.667 0 000 1.333zM8 11.333A.667.667 0 108 10a.667.667 0 000 1.333zM8 8.666a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 6a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 11.333a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 8.666a.667.667 0 100-1.333.667.667 0 000 1.333z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
