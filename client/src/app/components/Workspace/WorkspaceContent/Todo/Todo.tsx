import { TodoProps } from "@/app/utility/types/types";
import React, { useContext, useEffect, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";
import { useDraggable } from "@dnd-kit/core";

import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";

const Todo: React.FC<TodoProps> = ({ setIsTodoActive, widgetInfo }) => {
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

  const dynamicPosition = transform
    ? { x: transform.x, y: transform.y }
    : { x: 0, y: 0 };

  const combinedPosition = {
    xPos: staticPosition.xPos + dynamicPosition.x,
    yPos: staticPosition.yPos + dynamicPosition.y,
  };

  useEffect(() => {
    setIsDragging(dragging);
  }, [dragging]);

  return (
    <ResizableBox
      width={390}
      height={411}
      minConstraints={[400, 100]}
      maxConstraints={[950, 650]}
      style={{
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
      }}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-sm shadow-white/5  p-2"
    >
      {/* header section */}
      <div className="flex justify-between">
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
          className="text-gray-400 dark:text-lightText mr-1 pb-4 pl-2"
          onClick={setIsTodoActive}
        >
          <FaRegWindowMinimize
            size={14}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </button>
      </div>

      {/* divider */}
      <div className="w-full h-[1px] bg-white/25 dark:bg-lightBorder absolute right-0"></div>

      {/* content */}
      <div className="p-3">
        {/* add todo btn */}
        <div className="text-sm font-semibold">
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
      </div>

      {/* footer */}
      <div>footer</div>
    </ResizableBox>
  );
};

export default Todo;
