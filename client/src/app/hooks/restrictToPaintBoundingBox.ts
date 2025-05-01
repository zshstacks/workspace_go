import { Modifier } from "@dnd-kit/core";

export const restrictToPaintBoundingBox =
  (dimensionsPaint: { width: number; height: number }): Modifier =>
  ({ transform, activeNodeRect, containerNodeRect }) => {
    if (!activeNodeRect || !containerNodeRect) {
      return transform;
    }

    //restrictions where we can move paint
    const boundingBox = {
      top: 68,
      bottom: window.innerHeight + 8,
      left: 107,
      right: window.innerWidth + 105,
    };

    let newX = transform.x;
    let newY = transform.y;

    //calculate pos, considering the transformation
    const adjustedX = activeNodeRect.left + transform.x;
    const adjustedY = activeNodeRect.top + transform.y;

    //x pos
    if (adjustedX < boundingBox.left) {
      newX = boundingBox.left - activeNodeRect.left;
    } else if (adjustedX + dimensionsPaint.width > boundingBox.right) {
      newX = boundingBox.right - (activeNodeRect.left + dimensionsPaint.width);
    }

    //y pos
    if (adjustedY < boundingBox.top) {
      newY = boundingBox.top - activeNodeRect.top;
    } else if (adjustedY + dimensionsPaint.height > boundingBox.bottom) {
      newY = boundingBox.bottom - (activeNodeRect.top + dimensionsPaint.height);
    }

    return {
      ...transform,
      x: newX,
      y: newY,
    };
  };
