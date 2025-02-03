import { TodoProps } from "@/app/utility/types/types";
import React, { useContext } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";

const Todo: React.FC<TodoProps> = ({ setIsTodoActive }) => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Todo component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  return (
    <div
      className="w-[390px] h-[411px] bg-main dark:bg-lightMain text-white rounded-lg shadow-md p-3 "
      style={{
        position: "fixed",
      }}
    >
      {/* header section */}
      <div className="flex justify-between">
        <div>header</div>
        <button
          className="text-gray-400 dark:text-lightText  pb-4"
          onClick={setIsTodoActive}
        >
          <FaRegWindowMinimize
            size={14}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </button>
      </div>

      {/* divider */}
      <div className="w-[390px] h-[1px] bg-white/25 dark:bg-lightBorder absolute right-0"></div>
    </div>
  );
};

export default Todo;
