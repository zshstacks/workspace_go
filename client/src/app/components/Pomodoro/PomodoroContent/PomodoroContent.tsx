import React from "react";
import Header from "./Header/Header";
import PomoTimer from "./PomoTimer/PomoTimer";

const PomodoroContent = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* header */}
      <div className="h-[50px]">
        <Header />
      </div>

      {/* timer */}
      <div className="flex-grow flex justify-center items-center">
        <PomoTimer />
      </div>
    </div>
  );
};

export default PomodoroContent;
