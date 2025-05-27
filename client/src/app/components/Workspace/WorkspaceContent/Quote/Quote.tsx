import { QuoteProps } from "@/app/utility/types/componentTypes";
import { useDraggable } from "@dnd-kit/core";
import React, { useContext, useEffect, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";

const Quote: React.FC<QuoteProps> = ({
  setIsQuoteActive,
  opacity,
  activeWidget,
  setActiveWidget,
  widgetInfo,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Quote component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

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
    id: "quote-widget",
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

  return (
    <div
      onMouseDown={() => setActiveWidget("quote")}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-md shadow-white/5 dark:shadow-black/30 flex-1 flex flex-col "
      style={{
        opacity: opacity,
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
        zIndex: activeWidget === "quote" ? 100 : 50,
      }}
    >
      {/* header */}
      <div className="flex justify-between w-96 p-2">
        <div className="">
          <span className="w-21 flex font-semibold">Quote</span>
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
          onClick={setIsQuoteActive}
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
      <div className="flex-1 overflow-hidden">{quoteData?.quote}</div>
    </div>
  );
};

export default Quote;
