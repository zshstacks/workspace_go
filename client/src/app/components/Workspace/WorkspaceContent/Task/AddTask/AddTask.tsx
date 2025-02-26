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
    <div className="fixed inset-x-0 inset-y-12 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-main dark:bg-lightMain p-4 rounded-md shadow-md">
        <h2 className="text-lg font-bold mb-2">Create task</h2>
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 mb-2 rounded-md border border-neutral-600 bg-transparent text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="w-full p-2 mb-2 rounded-md border border-neutral-600 bg-transparent text-white resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600"
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
