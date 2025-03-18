import React from "react";
import { AiOutlineLoading } from "react-icons/ai";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]  ">
      <AiOutlineLoading size={23} color="white" className="animate-spin " />
    </div>
  );
};

export default LoadingSpinner;
