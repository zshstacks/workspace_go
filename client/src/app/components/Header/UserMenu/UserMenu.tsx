import React, { useContext } from "react";
import { FaUser } from "react-icons/fa";
import { PiGithubLogo } from "react-icons/pi";
import { VscSettings } from "react-icons/vsc";

import { UserMenuProps } from "@/app/utility/types/types";
import { MyContext } from "@/app/components/Workspace/Workspace";

const UserMenu: React.FC<UserMenuProps> = ({
  setOpenUISettings,
  setOpenAccSettings,
}) => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The UserMenu component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  return (
    <div className="bg-main dark:bg-lightMain rounded-md w-[155px] h-[150px] absolute top-[45px] right-2 shadow-xl shadow-gray-700 z-[9999]">
      {/* account settings */}
      <div
        className="flex gap-2 cursor-pointer p-2 z-[9999]"
        onClick={setOpenAccSettings}
      >
        <FaUser
          size={12}
          color={theme === "dark" ? "#4e4e4e" : "white"}
          className="my-auto"
        />
        <span className="dark:text-lightText">My account</span>
      </div>
      {/* divider */}
      <div className="h-[1px] w-full bg-white/25 dark:bg-lightBorder"></div>

      {/* appearance settings */}
      <div
        className="flex gap-2 cursor-pointer p-2"
        onClick={setOpenUISettings}
      >
        <VscSettings
          color={theme === "dark" ? "#4e4e4e" : "white"}
          className="my-auto"
        />
        <span className="dark:text-lightText">Appearance</span>
      </div>

      {/* divider */}
      <div className="h-[1px] w-full bg-white/25 dark:bg-lightBorder"></div>

      <div className="flex justify-center p-6 ">
        <a href="https://github.com/wlr1" target="_blank">
          <PiGithubLogo color={theme === "dark" ? "#4e4e4e" : "white"} />
        </a>
      </div>
    </div>
  );
};

export default UserMenu;
