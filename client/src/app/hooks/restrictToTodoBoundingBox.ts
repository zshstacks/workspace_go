import { Modifier } from "@dnd-kit/core";

export const restrictToTodoBoundingBox =
  (dimensions: { width: number; height: number }): Modifier =>
  ({ transform, activeNodeRect, containerNodeRect }) => {
    if (!activeNodeRect || !containerNodeRect) {
      return transform;
    }

    //restrictions where we can move todo
    const boundingBox = {
      top: 58,
      bottom: window.innerHeight + 8,
      left: 90,
      right: window.innerWidth + 89,
    };

    let newX = transform.x;
    let newY = transform.y;

    //calculate pos, considering the transformation
    const adjustedX = activeNodeRect.left + transform.x;
    const adjustedY = activeNodeRect.top + transform.y;

    //x pos
    if (adjustedX < boundingBox.left) {
      newX = boundingBox.left - activeNodeRect.left;
    } else if (adjustedX + dimensions.width > boundingBox.right) {
      newX = boundingBox.right - (activeNodeRect.left + dimensions.width);
    }

    //y pos
    if (adjustedY < boundingBox.top) {
      newY = boundingBox.top - activeNodeRect.top;
    } else if (adjustedY + dimensions.height > boundingBox.bottom) {
      newY = boundingBox.bottom - (activeNodeRect.top + dimensions.height);
    }

    return {
      ...transform,
      x: newX,
      y: newY,
    };
  };
