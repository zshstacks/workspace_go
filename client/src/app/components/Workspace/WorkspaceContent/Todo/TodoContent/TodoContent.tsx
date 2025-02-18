import React from "react";

const TodoContent = () => {
  return (
    <div className="flex flex-col absolute gap-2 p-3 w-full">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="border border-neutral-600 rounded-lg hover:border-sky-300/40  transition duration-200"
        >
          <div className="flex flex-col p-2 gap-2">
            <div className="flex items-center ">
              <span className="text-neutral-300 text-sm">Task Name</span>
            </div>

            <div className="relative w-full">
              <textarea
                className="w-full bg-transparent text-neutral-200 placeholder-neutral-500 resize-none focus:outline-none focus:ring-1 focus:ring-sky-300/40 hover:bg-neutral-700/50 rounded-md p-2 min-h-[98px] max-h-[400px] overflow-y-auto"
                rows={1}
                autoComplete="off"
                placeholder="Write your task here..."
                defaultValue={`collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax collfax`}
              ></textarea>
            </div>

            <div className="flex justify-end items-center">
              <span className="text-neutral-300 text-sm">#124</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoContent;
