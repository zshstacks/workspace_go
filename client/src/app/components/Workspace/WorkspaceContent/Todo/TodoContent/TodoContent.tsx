import React from "react";

const TodoContent = () => {
  return (
    <div className="flex flex-col gap-2 absolute top-0 right-0 bottom-0 left-0 px-4 ">
      <div className="border border-neutral-500/70 hover:border-sky-300/50 rounded-md">
        <div className="flex justify-between">
          <div>dd</div>
          <div className="border w-full hover:bg-neutral-700/50">
            <textarea className="text-sm text-wrap " rows={1}>
              ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
              ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
              ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
              ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
              ddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
            </textarea>
          </div>
          <div>dd</div>
        </div>
      </div>
    </div>
  );
};

export default TodoContent;
