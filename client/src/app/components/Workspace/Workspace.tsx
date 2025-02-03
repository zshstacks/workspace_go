"use client";

import React, { createContext, useState } from "react";
import WorkspaceContent from "@/app/components/Workspace/WorkspaceContent/WorkspaceContent";
import { ContextProps } from "@/app/utility/types/types";

export const MyContext = createContext<ContextProps | null>(null);
const Workspace = () => {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  return (
    <div className=" min-h-screen bg-cover bg-no-repeat bg-bgMain overflow-hidden ">
      <MyContext.Provider value={{ theme, setTheme }}>
        <WorkspaceContent />
      </MyContext.Provider>
    </div>
  );
};
export default Workspace;
