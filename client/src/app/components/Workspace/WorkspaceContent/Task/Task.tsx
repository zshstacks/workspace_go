import { TodoProps } from "@/app/utility/types/types";
import React, { useContext, useEffect, useRef, useState } from "react";

import { useToggleStateOutside } from "@/app/hooks/useToggleStateOutside";

import { MyContext } from "../../Workspace";
import TaskContent from "@/app/components/Workspace/WorkspaceContent/Task/TaskContent/TaskContent";

import { useDraggable } from "@dnd-kit/core";

import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { FaRegWindowMinimize } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { BsThreeDotsVertical } from "react-icons/bs";
import AddTask from "./AddTask/AddTask";
import { AppDispatch } from "@/app/redux/store";
import { useDispatch } from "react-redux";
import {
  deleteAllCompletedTasks,
  deleteAllTasks,
} from "@/app/redux/slices/taskSlice/asyncActions";

const Task: React.FC<TodoProps> = ({
  setIsTodoActive,
  widgetInfo,
  setDimensions,
  dimensions,
  activeWidget,
  setActiveWidget,
}) => {
  const [openActionMenu, setOpenActionMenu, toggleOpenActionMenu] =
    useToggleStateOutside(false);
  const [openFilterMenu, setOpenFilterMenu, toggleOpenFilterMenu] =
    useToggleStateOutside(false);

  const [isDragging, setIsDragging] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const dispatch: AppDispatch = useDispatch();

  const handleDeleteAllTasks = () => {
    dispatch(deleteAllTasks());
  };

  const handleDeleteAllCompletedTasks = () => {
    dispatch(deleteAllCompletedTasks());
  };

  const handleAddTaskClick = () => {
    setShowAddTask(true);
  };

  const handleCloseAddTask = () => {
    setShowAddTask(false);
  };

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Task component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  // menus
  const actionContainerRef = useRef<HTMLDivElement>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  //close  menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      //action menu
      if (
        actionContainerRef.current &&
        !actionContainerRef.current.contains(e.target as Node)
      ) {
        setOpenActionMenu(false);
      }

      //filter menu
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(e.target as Node)
      ) {
        setOpenFilterMenu(false);
      }
    };

    if (openActionMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    if (openFilterMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionMenu, setOpenActionMenu, setOpenFilterMenu, openFilterMenu]);

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
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-md shadow-white/5 flex-1 flex flex-col "
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
          <div ref={filterContainerRef}>
            <button
              className="bg-[#3d3e42] py-[1px] px-3 rounded-md flex gap-[1px] hover:bg-neutral-500/50"
              onClick={toggleOpenFilterMenu}
            >
              Filter
              {openFilterMenu ? (
                <MdOutlineKeyboardArrowUp
                  className=" mt-[2px]"
                  color={theme === "dark" ? "#4e4e4e" : "white"}
                  size={18}
                />
              ) : (
                <MdOutlineKeyboardArrowDown
                  className=" mt-[2px]"
                  color={theme === "dark" ? "#4e4e4e" : "white"}
                  size={18}
                />
              )}
            </button>
            {openFilterMenu && (
              <div className="fixed right-0 left-0 min-w-max transform translate-x-6 z-50">
                <div className="bg-main min-w-[250px] m-[4px] w-fit shadow-lg shadow-white/10 rounded-md">
                  <div className="flex w-full align-middle p-2 cursor-pointer hover:bg-neutral-700/50">
                    <div className="inline-block align-middle">
                      <input
                        type="checkbox"
                        className="border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px] [clip:rect(0_0_0_0)]"
                      />
                      <div className="block w-[16px] h-[16px] mr-[8px] cursor-pointer rounded-sm transition-all duration-150 appearance-none border border-neutral-700">
                        <svg
                          className="visible stroke-white fill-none "
                          viewBox="4 4 16 18"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                    <span>Hide Completed</span>
                  </div>
                  <div className="flex w-full align-middle p-2 cursor-pointer hover:bg-neutral-700/50">
                    <div>
                      <input
                        type="checkbox"
                        className="border-0 h-[1px] -m-[1px] overflow-hidden p-0 absolute whitespace-nowrap w-[1px] [clip:rect(0_0_0_0)]"
                      />
                      <div className="block w-[16px] h-[16px] mr-[8px] cursor-pointer rounded-sm transition-all duration-150 appearance-none border border-neutral-700"></div>
                    </div>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            )}
          </div>
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
          <button
            className=" gap-1 hover:bg-neutral-500/50 rounded-md w-full p-1"
            onClick={handleAddTaskClick}
          >
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
        <div className=" custom-scrollbar overflow-y-auto overflow-x-hidden relative flex flex-1 z-2">
          <TaskContent />
        </div>
      </div>

      {showAddTask && <AddTask onClose={handleCloseAddTask} />}

      {/* footer */}
      <div>
        {/* completed bar & actions btn */}
        <div className="flex justify-between align-middle p-2 ">
          {/* actions btn */}
          <div ref={actionContainerRef}>
            <button onClick={toggleOpenActionMenu}>
              <BsThreeDotsVertical size={13} />
            </button>
            {openActionMenu && (
              <div className="fixed right-0 left-0 min-w-max transform -translate-x-16">
                <div className="bg-main min-w-[250px] m-[4px] w-fit shadow-xl shadow-white/15 rounded-md text-sm">
                  <div
                    className="flex w-full align-middle p-2 cursor-pointer hover:bg-neutral-700/50"
                    onClick={handleDeleteAllTasks}
                  >
                    Delete all tasks
                  </div>
                  <div
                    className="flex w-full align-middle p-2 cursor-pointer hover:bg-neutral-700/50"
                    onClick={handleDeleteAllCompletedTasks}
                  >
                    Delete all completed tasks
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* completed bar */}
          <div className="flex flex-row w-full gap-2">
            <div className="rounded-2xl w-full h-[11px] m-auto bg-neutral-500/70"></div>
            <span className="text-sm font-semibold ">0/4</span>
          </div>
        </div>

        {/* resize  icon */}
        <div className="flex justify-end">
          <div className="" onMouseDown={handleMouseDown}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="white"
              className=" cursor-se-resize "
            >
              <path d="M5.333 11.333a.667.667 0 100-1.333.667.667 0 000 1.333zM8 11.333A.667.667 0 108 10a.667.667 0 000 1.333zM8 8.666a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 6a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 11.333a.667.667 0 100-1.333.667.667 0 000 1.333zM10.667 8.666a.667.667 0 100-1.333.667.667 0 000 1.333z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
