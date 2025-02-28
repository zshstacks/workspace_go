import {
  completeTask,
  deleteTask,
  getAllTasks,
  updateTaskDescription,
  updateTaskTitle,
} from "@/app/redux/slices/taskSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import React, { useEffect } from "react";

import { IoMdCheckmark } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";

const TaskContent = () => {
  const dispatch: AppDispatch = useDispatch();
  const { tasks } = useSelector((state: RootState) => state.tasks);

  const CHARACTER_LIMIT = 800;

  //complete task
  const handleCompleteTask = (taskId: number, isCompleted: boolean) => {
    dispatch(completeTask({ id: taskId, completed: !isCompleted }));
  };

  //delete task
  const handleDeleteTask = (taskId: number) => {
    dispatch(deleteTask(taskId));
  };

  // auto adapt textarea height
  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const textLength = textarea.value.length;

    if (textLength <= CHARACTER_LIMIT) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    } else {
      textarea.style.overflowY = "auto";
    }
  };

  // Initialize the textarea height after rendering the components
  useEffect(() => {
    document.querySelectorAll(".auto-resize-textarea").forEach((textarea) => {
      if (textarea instanceof HTMLTextAreaElement) {
        const textLength = textarea.value.length;

        if (textLength <= CHARACTER_LIMIT) {
          textarea.style.height = "auto";
          textarea.style.height = `${textarea.scrollHeight}px`;
          textarea.style.overflowY = "hidden";
        } else {
          textarea.style.overflowY = "auto";
        }
      }
    });
  }, [tasks]);

  useEffect(() => {
    dispatch(getAllTasks()); //fetch tasks
  }, [dispatch]);

  return (
    <div className="flex flex-col absolute gap-2 p-6 w-full">
      {tasks.map((task) => (
        <div
          key={task.LocalID}
          className={`border border-neutral-600 rounded-lg hover:border-sky-300/40  transition duration-200 ${
            task.Completed ? "border-neutral-700 hover:border-sky-500/30" : ""
          }`}
        >
          <div className=" absolute left-1 cursor-grab">
            <RxDragHandleDots2
              className="absolute top-4 text-gray-500 hover:text-white transition-colors duration-200"
              size={20}
            />
          </div>

          <div className="flex flex-col relative p-2 gap-2">
            <div className="flex items-center ">
              <textarea
                className={`w-[75%] bg-transparent text-neutral-300 text-sm placeholder-neutral-500 resize-none focus:outline-none hover:bg-neutral-700/50 rounded-md p-2 ${
                  task.Completed ? "line-through text-neutral-500" : ""
                }`}
                rows={1}
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
              ></textarea>
            </div>

            <div className="relative w-full">
              <div className="flex flex-row justify-start align-baseline min-w-fit w-full">
                <textarea
                  className={`auto-resize-textarea w-full bg-transparent text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none hover:bg-neutral-700/50 rounded-md p-2  ${
                    task.Completed ? "line-through text-neutral-500" : ""
                  }`}
                  rows={1}
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
                ></textarea>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="gap-2 flex text-sm text-neutral-500 ">
                <button
                  className="hover:text-neutral-300"
                  onClick={() =>
                    handleCompleteTask(task.LocalID, task.Completed)
                  }
                >
                  <IoMdCheckmark />
                </button>
                <button
                  className="hover:text-neutral-300"
                  onClick={() => handleDeleteTask(task.LocalID)}
                >
                  <RiDeleteBin6Line />
                </button>
              </div>

              <span
                className={`text-neutral-300 text-sm ${
                  task.Completed ? "line-through text-neutral-500" : ""
                }`}
              >
                #{task.LocalID}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskContent;
