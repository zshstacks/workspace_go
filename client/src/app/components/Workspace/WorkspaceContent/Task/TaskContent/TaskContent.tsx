import {
  deleteTask,
  getAllTasks,
  updateTaskDescription,
} from "@/app/redux/slices/taskSlice/asyncActions";
import { AppDispatch, RootState } from "@/app/redux/store";
import { useDispatch, useSelector } from "react-redux";

import React, { useEffect } from "react";

import { IoMdCheckmark } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";

const TaskContent = () => {
  const dispatch: AppDispatch = useDispatch();
  const { tasks } = useSelector((state: RootState) => state.tasks);

  //delete task
  const handleDeleteTask = (taskId: number) => {
    dispatch(deleteTask(taskId));
  };

  useEffect(() => {
    dispatch(getAllTasks()); //fetch tasks
  }, [dispatch]);

  return (
    <div className="flex flex-col absolute gap-2 p-3 w-full">
      {tasks.map((task) => (
        <div
          key={task.LocalID}
          className="border border-neutral-600 rounded-lg hover:border-sky-300/40  transition duration-200"
        >
          <div className="flex flex-col p-2 gap-2">
            <div className="flex items-center ">
              <span className="text-neutral-300 text-sm">{task.Title}</span>
            </div>

            <div className="relative w-full">
              <textarea
                className="w-full bg-transparent text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none  hover:bg-neutral-700/50 rounded-md p-2 min-h-[98px] max-h-[400px] overflow-y-auto"
                rows={1}
                autoComplete="off"
                placeholder="Write your task here..."
                defaultValue={task.Description}
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
              ></textarea>
            </div>

            <div className="flex justify-between items-center">
              <div className="gap-2 flex text-sm text-neutral-500 ">
                <button className="hover:text-neutral-300">
                  <IoMdCheckmark />
                </button>
                <button
                  className="hover:text-neutral-300"
                  onClick={() => handleDeleteTask(task.LocalID)}
                >
                  <RiDeleteBin6Line />
                </button>
              </div>

              <span className="text-neutral-300 text-sm">#{task.LocalID}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskContent;
