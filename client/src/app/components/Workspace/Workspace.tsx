"use client";

import React, { createContext, useEffect, useState } from "react";
import WorkspaceContent from "@/app/components/Workspace/WorkspaceContent/WorkspaceContent";
import { ContextProps } from "@/app/utility/types/types";
import VideoBackground from "./VideoBackground";

export const MyContext = createContext<ContextProps | null>(null);
const STORAGE_KEY_BG = process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY_BG as string;
const DEFAULT_BG = "8plwv25NYRo";

const Workspace = () => {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [videoId, setVideoId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY_BG);
      return saved ?? DEFAULT_BG;
    }
    return DEFAULT_BG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BG, videoId);
  }, [videoId]);

  return (
    <div className=" min-h-screen overflow-hidden ">
      <MyContext.Provider value={{ theme, setTheme, videoId, setVideoId }}>
        <VideoBackground />

        <WorkspaceContent />
      </MyContext.Provider>
    </div>
  );
};
export default Workspace;
