"use client";

import React, { createContext, useMemo, useState } from "react";
import WorkspaceContent from "@/app/components/Workspace/WorkspaceContent/WorkspaceContent";
import { ContextProps } from "@/app/utility/types/types";
import VideoBackground from "./VideoBackground";
import { useDebounceLocalStorage } from "@/app/hooks/useDebounceLocalStorage";

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

  useDebounceLocalStorage(STORAGE_KEY_BG, videoId, 1000);

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      videoId,
      setVideoId,
    }),
    [theme, videoId]
  );

  return (
    <div className=" min-h-screen overflow-hidden ">
      <MyContext.Provider value={contextValue}>
        <div>
          <VideoBackground />
        </div>

        <WorkspaceContent />
      </MyContext.Provider>
    </div>
  );
};
export default Workspace;
