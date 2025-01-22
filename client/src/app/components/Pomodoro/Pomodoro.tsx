"use client";

import React, { createContext, useState } from "react";
import PomodoroContent from "./PomodoroContent/PomodoroContent";
import { ContextProps } from "@/app/utility/types/types";

export const MyContext = createContext<ContextProps | null>(null);
const Pomodoro = () => {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  return (
    <div className="min-h-screen bg-cover bg-no-repeat bg-bgMain overflow-hidden ">
      <MyContext.Provider value={{ theme, setTheme }}>
        <PomodoroContent />
      </MyContext.Provider>
    </div>
  );
};

export default Pomodoro;

{
  /* <div className="min-h-screen relative overflow-hidden">
     
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
      >
        <source src="/uploads/amsterdam.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

     
      <div className="relative z-10">
        <PomodoroContent />
      </div>

      
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-5"></div>
    </div>  */
}
