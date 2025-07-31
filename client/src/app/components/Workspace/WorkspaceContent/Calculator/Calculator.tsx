import { CalculatorProps } from "@/app/utility/types/componentTypes";
import { useDraggable } from "@dnd-kit/core";
import React, { useContext, useEffect, useState } from "react";
import { FaRegWindowMinimize } from "react-icons/fa";
import { MyContext } from "../../Workspace";

const Calculator: React.FC<CalculatorProps> = ({
  setIsCalculatorActive,
  opacity,
  activeWidget,
  setActiveWidget,
  widgetInfo,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [display, setDisplay] = useState<string>("0");
  const [overwrite, setOverwrite] = useState<boolean>(true);
  const [lastWasOperator, setLastWasOperator] = useState<boolean>(false);

  const context = useContext(MyContext);

  if (!context) {
    throw new Error(
      "The Calculator component should be used within MyContext.Provider."
    );
  }

  const { theme } = context;

  //=====================
  // DnD logic
  //=====================

  const staticPosition = widgetInfo ? widgetInfo : { xPos: 0, yPos: 0 };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dragging,
  } = useDraggable({
    id: "calculator-widget",
  });

  useEffect(() => {
    setIsDragging(dragging);
  }, [dragging]);

  const dynamicPosition = transform
    ? { x: transform.x, y: transform.y }
    : { x: 0, y: 0 };

  const combinedPosition = {
    xPos: staticPosition.xPos + dynamicPosition.x,
    yPos: staticPosition.yPos + dynamicPosition.y,
  };

  const handleClear = () => {
    setDisplay("0");
    setOverwrite(true);
    setLastWasOperator(false);
  };

  const handleDelete = () => {
    if (display.length === 1) {
      setDisplay("0");
      setOverwrite(true);
      setLastWasOperator(false);
    } else {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);

      const lastChar = newDisplay[newDisplay.length - 1];
      setLastWasOperator(["+", "−", "×", "÷"].includes(lastChar));
    }
  };

  const handleDigit = (digit: string) => {
    if (overwrite) {
      setDisplay(digit);
      setOverwrite(false);
    } else {
      setDisplay((prev) => (prev === "0" ? digit : prev + digit));
    }
    setLastWasOperator(false);
  };

  const handleDot = () => {
    if (overwrite) {
      setDisplay("0.");
      setOverwrite(false);
      setLastWasOperator(false);
      return;
    }

    const parts = display.split(/[+\−×÷]/);
    const currentNumber = parts[parts.length - 1];

    if (!currentNumber.includes(".")) {
      setDisplay((prev) => prev + ".");
      setLastWasOperator(false);
    }
  };

  const handleOperation = (op: string) => {
    if (lastWasOperator) {
      setDisplay((prev) => prev.slice(0, -1) + op);
    } else {
      setDisplay((prev) => prev + op);
    }
    setLastWasOperator(true);
    setOverwrite(false);
  };

  const handleEquals = () => {
    try {
      if (lastWasOperator) {
        return;
      }

      const expression = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

      if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
        setDisplay("Error");
        setOverwrite(true);
        setLastWasOperator(false);
        return;
      }

      // eslint-disable-next-line no-eval
      const result = eval(expression);

      if (isNaN(result) || !isFinite(result)) {
        setDisplay("Error");
      } else {
        setDisplay(String(result));
      }
    } catch {
      setDisplay("Error");
    }
    setOverwrite(true);
    setLastWasOperator(false);
  };

  const buttons = [
    { label: "C", onClick: handleClear, className: "text-secondary" },
    { label: "DEL", onClick: handleDelete },
    { label: "÷", onClick: () => handleOperation("÷") },
    { label: "×", onClick: () => handleOperation("×") },
    { label: "7", onClick: () => handleDigit("7") },
    { label: "8", onClick: () => handleDigit("8") },
    { label: "9", onClick: () => handleDigit("9") },
    { label: "−", onClick: () => handleOperation("−") },
    { label: "4", onClick: () => handleDigit("4") },
    { label: "5", onClick: () => handleDigit("5") },
    { label: "6", onClick: () => handleDigit("6") },
    { label: "+", onClick: () => handleOperation("+") },
    { label: "1", onClick: () => handleDigit("1") },
    { label: "2", onClick: () => handleDigit("2") },
    { label: "3", onClick: () => handleDigit("3") },
    {
      label: "=",
      onClick: handleEquals,
      className: "row-span-2 bg-blue-600 text-white",
    },
    { label: "0", onClick: () => handleDigit("0"), className: "col-span-2" },
    { label: ".", onClick: handleDot },
  ];

  return (
    <div
      onMouseDown={() => setActiveWidget("calculator")}
      className="bg-main dark:bg-lightMain text-white dark:text-lightText rounded-lg shadow-md shadow-white/5 dark:shadow-black/30 flex-1 flex flex-col "
      style={{
        opacity: opacity,
        transform: `translate3d(${combinedPosition.xPos}px, ${combinedPosition.yPos}px, 0)`,
        position: "fixed",
        zIndex: activeWidget === "calculator" ? 100 : 50,
      }}
    >
      {/* header */}
      <div className="flex justify-between w-96 p-2">
        <div className="">
          <span className="w-21 flex font-semibold">Calculator</span>
        </div>

        {/* div for dnd  */}
        <div
          className=" w-full h-[30px] flex "
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        ></div>

        {/* minimize btn */}
        <button
          className="text-gray-400 dark:text-lightText mr-1 pb-2 pl-2"
          onClick={setIsCalculatorActive}
        >
          <FaRegWindowMinimize
            size={14}
            color={theme === "dark" ? "#4e4e4e" : "white"}
          />
        </button>
      </div>

      {/* divider */}
      <div className="w-full h-[1px] bg-white/25 dark:bg-lightBorder "></div>

      {/* content */}
      {/* Display */}
      <div className=" text-right p-4">
        <span className="text-right text-2xl font-mono break-all">
          {display}
        </span>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 grid-rows-5 gap-1 p-2">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className={`
              py-3 rounded-lg text-lg bg-white/10 hover:bg-white/20
              ${btn.className ?? ""}
              ${btn.label === "=" ? "row-span-2" : ""}
              ${btn.label === "0" ? "col-span-2" : ""}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
