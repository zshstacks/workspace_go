import { Modifier } from "@dnd-kit/core";

export const restrictToBoundingBox =
  (openSettings: boolean): Modifier =>
  ({ transform, activeNodeRect, containerNodeRect }) => {
    if (!activeNodeRect || !containerNodeRect) {
      return transform;
    }

    //when pomo settings is open
    const settingsHeight = openSettings ? 348 : 0;

    const boundingBox = {
      top: 50, // top y cord
      bottom: window.innerHeight - 127 - settingsHeight, // bott y cord
      left: 16, // left x cord
      right: window.innerWidth - 74, // right x cord
    };

    let newX = transform.x;
    let newY = transform.y;

    const adjustedX = activeNodeRect.left + transform.x;
    const adjustedY = activeNodeRect.top + transform.y;

    if (adjustedX < boundingBox.left) {
      newX = boundingBox.left - activeNodeRect.left;
    } else if (adjustedX + activeNodeRect.width > boundingBox.right) {
      newX = boundingBox.right - (activeNodeRect.left + activeNodeRect.width);
    }

    if (adjustedY < boundingBox.top) {
      newY = boundingBox.top - activeNodeRect.top;
    } else if (adjustedY + activeNodeRect.height > boundingBox.bottom) {
      newY = boundingBox.bottom - (activeNodeRect.top + activeNodeRect.height);
    }

    return {
      ...transform, // saving scaleX & scaleY
      x: newX,
      y: newY,
    };
  };
