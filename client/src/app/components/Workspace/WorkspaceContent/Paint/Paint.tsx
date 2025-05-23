import { PaintProps } from "@/app/utility/types/componentTypes";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { MyContext } from "../../Workspace";
import { useDraggable } from "@dnd-kit/core";
import { FaRegWindowMinimize } from "react-icons/fa";
import FabricDrawing from "@/app/components/Workspace/WorkspaceContent/Paint/FabricDrawing/FabricDrawing";

const Paint: React.FC<PaintProps> = ({
  setIsPaintActive,
  widgetInfo,
  activeWidget,
  setActiveWidget,
  dimensionsPaint,
  setDimensionsPaint,
  opacity,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Task component should be used within MyContext.Provider."
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
    id: "paint-widget",
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
      const startWidth = dimensionsPaint.width;
      const startHeight = dimensionsPaint.height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        let newWidth = startWidth + deltaX;
        let newHeight = startHeight + deltaY;

        if (newWidth < minWidth) newWidth = minWidth;
        if (newWidth > maxWidth) newWidth = maxWidth;
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;

        setDimensionsPaint({ width: newWidth, height: newHeight });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [dimensionsPaint.width, dimensionsPaint.height, setDimensionsPaint]
  );

  return (
    <div
      onMouseDown={() => setActiveWidget("paint")}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-md shadow-white/5 dark:shadow-black/30 flex-1 flex flex-col "
      style={{
        opacity: opacity,
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
        width: dimensionsPaint.width,
        height: dimensionsPaint.height,
        zIndex: activeWidget === "paint" ? 100 : 50,
      }}
    >
      {/* header */}
      <div className="flex justify-between p-2">
        <div className="">
          <span className="w-48 flex">Draw your imaginations</span>
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
          onClick={setIsPaintActive}
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
        <FabricDrawing
          width={dimensionsPaint.width}
          height={dimensionsPaint.height}
        />
      </div>

      {/* footer */}
      <div className="mt-auto">
        {/* resize  icon */}
        <div className="flex justify-end" onMouseDown={handleMouseDown}>
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

export default Paint;
