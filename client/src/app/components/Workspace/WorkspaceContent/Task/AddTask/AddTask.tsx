import { createTask } from "@/app/redux/slices/taskSlice/asyncActions";
import { AppDispatch } from "@/app/redux/store";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

interface AddTaskProps {
  onClose: () => void;
}

const AddTask: React.FC<AddTaskProps> = ({ onClose }) => {
  const dispatch: AppDispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!title.trim() && !description.trim()) {
      onClose();
      return;
    }

    await dispatch(createTask({ title, description }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="  p-4 rounded-md  w-full max-w-md">
        <h2 className="text-lg font-semibold text-neutral-100 mb-3">
          Create task
        </h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 mb-2 rounded-md  bg-main text-neutral-300 placeholder-neutral-500 focus:outline-none hover:bg-neutral-700 transition-colors"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 mb-4 rounded-md  bg-main text-neutral-300 placeholder-neutral-500 resize-none focus:outline-none hover:bg-neutral-700 transition-colors"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded-md border border-neutral-600 bg-neutral-600 text-neutral-300 hover:bg-neutral-700/50 transition-colors"
            onClick={onClose}
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
