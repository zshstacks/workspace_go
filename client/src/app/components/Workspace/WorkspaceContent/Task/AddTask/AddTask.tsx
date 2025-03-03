import { createTask } from "@/app/redux/slices/taskSlice/asyncActions";
import { clearCreateErrors } from "@/app/redux/slices/taskSlice/taskSlice";
import { AppDispatch, RootState } from "@/app/redux/store";
import React, { useState } from "react";
import { BsQuestion } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";

interface AddTaskProps {
  onClose: () => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { createDescriptionError, createTitleError } = useSelector(
    (state: RootState) => state.tasks
  );

  const handleClose = () => {
    onClose();
    dispatch(clearCreateErrors());
  };

  const handleSave = async () => {
    const result = await dispatch(createTask({ title, description }));

    if (!createTask.rejected.match(result)) {
      onClose();
      dispatch(clearCreateErrors());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="  p-4 rounded-md  w-full max-w-md">
        <label className=" text-lg font-medium text-neutral-100 mb-1 flex items-center gap-1">
          Create task
          <div className="relative group">
            <BsQuestion className="text-gray-400 cursor-pointer " size={14} />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-500/20 backdrop-blur-md  text-neutral-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Title: 2-85 char.; Description: 1-870 char.;
            </div>
          </div>
        </label>
        <input
          type="text"
          placeholder="Title"
          className={`w-full p-2 mb-2 rounded-md  bg-main text-neutral-300 placeholder-neutral-500 focus:outline-none hover:bg-neutral-700 transition-colors ${
            createTitleError ? "border border-red-500" : ""
          }`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className={`w-full p-2 mb-4 rounded-md  bg-main text-neutral-300 placeholder-neutral-500 resize-none focus:outline-none hover:bg-neutral-700 transition-colors ${
            createDescriptionError ? "border border-red-500 " : ""
          }`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded-md border border-neutral-600 bg-neutral-600 text-neutral-300 hover:bg-neutral-700/50 transition-colors"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded-md bg-secondary text-white hover:bg-secondary/70 transition-colors"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTask;
