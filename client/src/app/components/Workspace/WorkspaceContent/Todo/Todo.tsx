import { TodoProps } from "@/app/utility/types/types";
import React, { useContext, useEffect, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";
import { useDraggable } from "@dnd-kit/core";

import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { IoResizeOutline } from "react-icons/io5";

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
      minConstraints={[400, 400]}
      maxConstraints={[650, 650]}
      style={{
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
      }}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-md p-3"
    >
      {/* header section */}
      <div className="flex justify-between">
        <div className="">header</div>
        {/* div for dnd  */}
        <div
          className=" w-full h-[30px] flex "
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        ></div>
        <button
          className="text-gray-400 dark:text-lightText  pb-4"
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
    </ResizableBox>
  );
};

export default Todo;
