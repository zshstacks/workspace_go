"use client";

import React from "react";
import "@/app/styles/globals.css";

import dynamic from "next/dynamic";

const Workspace = dynamic(
  () => import("@/app/components/Workspace/Workspace"),
  { ssr: false }
);

const WorkspaceClient = () => {
  return (
    <div suppressHydrationWarning={true}>
      <Workspace />
    </div>
  );
};

export default WorkspaceClient;
