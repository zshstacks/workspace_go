import React, { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { RenderModalComponentProps } from "@/app/utility/types/types";

const RenderModalComponent = <T extends Record<string, unknown>>({
  isOpen,
  Component,
  props,
}: RenderModalComponentProps<T>) => {
  if (!isOpen) return null;

  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <Component {...props} />
      </Suspense>
    </div>
  );
};

export default RenderModalComponent;
