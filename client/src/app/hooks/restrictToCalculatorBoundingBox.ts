import { Modifier } from "@dnd-kit/core";

export const restrictToCalculatorBoundingBox =
  (dimensionsMedia: { width: number; height: number }): Modifier =>
  ({ transform, activeNodeRect, containerNodeRect }) => {
    if (!activeNodeRect || !containerNodeRect) {
      return transform;
    }

    //restrictions where we can move
    const boundingBox = {
      top: 58,
      bottom: window.innerHeight + 84,
      left: 80,
      right: window.innerWidth + 287,
    };

    let newX = transform.x;
    let newY = transform.y;

    //calculate pos, considering the transformation
    const adjustedX = activeNodeRect.left + transform.x;
    const adjustedY = activeNodeRect.top + transform.y;

    //x pos
    if (adjustedX < boundingBox.left) {
      newX = boundingBox.left - activeNodeRect.left;
    } else if (adjustedX + dimensionsMedia.width > boundingBox.right) {
      newX = boundingBox.right - (activeNodeRect.left + dimensionsMedia.width);
    }

    //y pos
    if (adjustedY < boundingBox.top) {
      newY = boundingBox.top - activeNodeRect.top;
    } else if (adjustedY + dimensionsMedia.height > boundingBox.bottom) {
      newY = boundingBox.bottom - (activeNodeRect.top + dimensionsMedia.height);
    }

    return {
      ...transform,
      x: newX,
      y: newY,
    };
  };
