"use client";

import React, { useEffect, useState } from "react";
import Header from "../../Header/Header";
import PomoTimer from "./PomoTimer/PomoTimer";
import { DndContext } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { Position } from "@/app/utility/types/types";

const localStorageKey =
  process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || "widgetPosition";

const PomodoroContent = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  // Ielādēt saglabāto pozīciju no localStorage, ja tāda ir
  useEffect(() => {
    const savedPosition = localStorage.getItem(localStorageKey);
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  // Saglabāt jauno pozīciju vietējā glabātuvē
  const savePosition = (newPosition: Position) => {
    setPosition(newPosition);
    localStorage.setItem(localStorageKey, JSON.stringify(newPosition));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* header */}
      <div className="h-[50px]">
        <Header />
      </div>

      {/* timer */}

      <div className="flex-grow flex justify-center items-center ">
        <DndContext
          modifiers={[restrictToWindowEdges]}
          onDragEnd={(event) => {
            const { delta } = event;
            const newPosition = {
              x: position.x + delta.x,
              y: position.y + delta.y,
            };
            savePosition(newPosition);
          }}
        >
          <div>
            <PomoTimer position={position} />
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default PomodoroContent;
