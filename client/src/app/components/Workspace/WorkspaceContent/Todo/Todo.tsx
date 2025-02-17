import { TodoProps } from "@/app/utility/types/types";
import React, { useContext, useEffect, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";
import { useDraggable } from "@dnd-kit/core";

import { MdOutlineKeyboardArrowDown } from "react-icons/md";

import { BsThreeDotsVertical } from "react-icons/bs";
import TodoContent from "./TodoContent/TodoContent";
import { IoIosAdd } from "react-icons/io";

const Todo: React.FC<TodoProps> = ({
  setIsTodoActive,
  widgetInfo,
  setDimensions,
  dimensions,
  activeWidget,
  setActiveWidget,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Todo component should be used within MyContext.Provider."
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
    id: "todo-widget",
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

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;

      if (newWidth < minWidth) newWidth = minWidth;
      if (newWidth > maxWidth) newWidth = maxWidth;
      if (newHeight < minHeight) newHeight = minHeight;
      if (newHeight > maxHeight) newHeight = maxHeight;

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      onMouseDown={() => setActiveWidget("todo")}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-sm shadow-white/5 flex-1 flex flex-col "
      style={{
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
        width: dimensions.width,
        height: dimensions.height,
        zIndex: activeWidget === "todo" ? 100 : 50,
      }}
    >
      {/* header section */}
      <div className="flex justify-between p-2 ">
        <div className="text-sm font-semibold ">
          <button className="bg-[#3d3e42] py-[1px] px-3 rounded-md flex gap-[1px] hover:bg-neutral-500/50">
            Filter
            <MdOutlineKeyboardArrowDown
              className=" mt-[2px]"
              color={theme === "dark" ? "#4e4e4e" : "white"}
              size={18}
            />
          </button>
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
          onClick={setIsTodoActive}
        >
          <FaRegWindowMinimize
            size={14}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </button>
      </div>

      {/* divider */}
      <div className="w-full h-[1px] bg-white/25 dark:bg-lightBorder "></div>

      <div className="flex-1 flex flex-col">
        {/* add todo btn */}
        <div className="text-sm font-semibold px-4 py-2">
          <button className=" gap-1 hover:bg-neutral-500/50 rounded-md w-full p-1">
            <span className="flex items-center ml-3">
              <IoIosAdd
                size={19}
                color={theme === "dark" ? "#4e4e4e" : "white"}
              />
              Add task
            </span>
          </button>
        </div>

        {/* content */}
        <div className=" custom-scrollbar overflow-y-auto overflow-x-hidden relative flex flex-1">
          <TodoContent />
        </div>
      </div>

      {/* footer */}
      <div>
        {/* completed bar & actions btn */}
        <div className="flex justify-between align-middle p-2 ">
          {/* actions btn */}
          <button>
            <BsThreeDotsVertical size={13} />
          </button>
          {/* completed bar */}
          <div className="flex flex-row w-full gap-2">
            <div className="rounded-2xl w-full h-[11px] m-auto bg-neutral-500/70"></div>
            <span className="text-sm font-semibold ">0/4</span>
          </div>
        </div>

        {/* resize  icon */}
        <div className="flex justify-end cursor-se-resize ">
          <div className="" onMouseDown={handleMouseDown}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <path d="M5.333 11.333a.667.667 0 100-1.333.667.667 0 000 1.333zM8 11.333A.667.667 0 108 10a.667.667 0 000 1.333zM8 8.666a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 6a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 11.333a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 8.666a.667.667 0 100-1.333.667.667 0 000 1.333z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;
