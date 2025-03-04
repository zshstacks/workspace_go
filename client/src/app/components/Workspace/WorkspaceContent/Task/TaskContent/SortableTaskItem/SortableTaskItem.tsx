import {
  updateTaskDescription,
  updateTaskTitle,
} from "@/app/redux/slices/taskSlice/asyncActions";

import { SortableTaskItemProps } from "@/app/utility/types/types";
import { useSortable } from "@dnd-kit/sortable";

import React, { useEffect } from "react";
import { IoMdCheckmark } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  handleCompleteTask,
  handleDeleteTask,
  autoResizeTextarea,
  CHARACTER_LIMIT,
  dispatch,
  isDragging = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.LocalID });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined, //when dragging u can see components moving
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
    zIndex: isSortableDragging ? 1 : 0,
  };

  useEffect(() => {
    document.querySelectorAll(".auto-resize-textarea").forEach((textarea) => {
      if (textarea instanceof HTMLTextAreaElement) {
        const textLength = textarea.value.length;
        textarea.style.height =
          textLength <= CHARACTER_LIMIT ? "auto" : `${textarea.scrollHeight}px`;
      }
    });
  }, [CHARACTER_LIMIT]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-neutral-600 dark:border-neutral-300 rounded-lg transition duration-200 
      ${task.Completed ? "border-neutral-700" : ""}
      ${
        isSortableDragging
          ? "opacity-40"
          : "hover:border-sky-300/40 dark:hover:border-sky-300/40"
      }
      ${
        isDragging
          ? "border-sky-500 shadow-lg shadow-sky-500/25 bg-main/70 dark:bg-neutral-300/30"
          : ""
      }
    `}
    >
      {/* dnd handle */}
      <div
        className="absolute left-1 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <RxDragHandleDots2
          className={`absolute top-4 transition-colors duration-200 
          ${
            isSortableDragging || isDragging
              ? "text-sky-500 "
              : "text-gray-500 dark:text-gray-600 hover:text-white dark:hover:text-gray-400"
          }`}
          size={20}
        />
      </div>

      <div className="flex flex-col relative p-2 gap-2">
        <div className="flex items-center ">
          <textarea
            className={`w-[75%] bg-transparent text-neutral-300 dark:text-neutral-700 text-sm placeholder-neutral-500 resize-none focus:outline-none hover:bg-neutral-700/50 dark:hover:bg-neutral-300/50 rounded-md p-2 ${
              task.Completed
                ? "line-through text-neutral-500 dark:text-neutral-400"
                : ""
            } `}
            rows={1}
            maxLength={85}
            autoComplete="off"
            placeholder="Write your task title here..."
            defaultValue={task.Title}
            onChange={autoResizeTextarea}
            onBlur={(e) => {
              if (e.target.value !== task.Title) {
                dispatch(
                  updateTaskTitle({
                    id: task.LocalID,
                    title: e.target.value,
                  })
                );
              }
            }}
            readOnly={isDragging || isSortableDragging}
          ></textarea>
        </div>

        <div className="relative w-full">
          <div className="flex flex-row justify-start align-baseline min-w-fit w-full">
            <textarea
              className={`auto-resize-textarea w-full bg-transparent text-neutral-200 dark:text-neutral-700 placeholder-neutral-500 resize-none focus:outline-none hover:bg-neutral-700/50 dark:hover:bg-neutral-300/50 rounded-md p-2 ${
                task.Completed
                  ? "line-through text-neutral-500 dark:text-neutral-400"
                  : ""
              }`}
              rows={1}
              maxLength={870}
              autoComplete="off"
              placeholder="Write your task here..."
              defaultValue={task.Description}
              onChange={autoResizeTextarea}
              onBlur={(e) => {
                if (e.target.value !== task.Description) {
                  dispatch(
                    updateTaskDescription({
                      id: task.LocalID,
                      description: e.target.value,
                    })
                  );
                }
              }}
              style={{
                height: "39px",
              }}
              readOnly={isDragging || isSortableDragging}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div
            className={`gap-2 flex text-sm text-neutral-500 dark:text-neutral-600 ${
              task.Completed ? "dark:text-neutral-400" : ""
            }`}
          >
            <button
              className="hover:text-neutral-300 dark:hover:text-neutral-400"
              onClick={() => handleCompleteTask(task.LocalID, task.Completed)}
              disabled={isDragging || isSortableDragging}
            >
              <IoMdCheckmark />
            </button>
            <button
              className="hover:text-neutral-300 dark:hover:text-neutral-400"
              onClick={() => handleDeleteTask(task.LocalID)}
              disabled={isDragging || isSortableDragging}
            >
              <RiDeleteBin6Line />
            </button>
          </div>

          <span
            className={`text-neutral-300 dark:text-neutral-600 text-sm ${
              task.Completed
                ? "line-through text-neutral-500 dark:text-neutral-400"
                : ""
            }`}
          >
            #{task.LocalID}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SortableTaskItem;
