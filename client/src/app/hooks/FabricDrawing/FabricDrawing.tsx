import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { FabricProps } from "@/app/utility/types/componentTypes";

import { RiDeleteBin6Line } from "react-icons/ri";

const FabricDrawing: React.FC<FabricProps> = ({ width, height }) => {
  const [drawingMode, setDrawingMode] = useState<boolean>(true);
  const [brushType, setBrushType] = useState<string>("Pencil");
  const [color, setColor] = useState<string>("#000000");
  const [shadowColor, setShadowColor] = useState<string>("#ffffff");
  const [lineWidth, setLineWidth] = useState<number>(1);
  const [shadowWidth, setShadowWidth] = useState<number>(0);
  const [shadowOffset, setShadowOffset] = useState<number>(0);

  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const brushesRef = useRef<Record<string, any>>({});

  //init fabric canvas and brush patterns
  useEffect(() => {
    if (!canvasElRef.current) return; //no canvas, stopping

    //create a new fabric canvas instance and setup if can draw?
    const canvas = new fabric.Canvas(canvasElRef.current, {
      isDrawingMode: drawingMode,
    });
    canvasRef.current = canvas;

    //Remove corner transparency for menus etc...
    fabric.FabricObject.prototype.transparentCorners = false;

    //If the Fabric library has a PatternBrush class, we can prepare different types of pattern brushes
    if ((fabric as any).PatternBrush) {
      const PatternBrush = (fabric as any).PatternBrush;

      //vertical line pattern
      const vLine = new PatternBrush(canvas);
      vLine.getPatternSrc = function () {
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.stroke();
        return patternCanvas;
      };

      //horizontal line pattern
      const hLine = new PatternBrush(canvas);
      hLine.getPatternSrc = function () {
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.stroke();
        return patternCanvas;
      };

      //Square pattern
      const square = new PatternBrush(canvas);
      square.getPatternSrc = function () {
        const squareSize = 10;
        const dist = 2;
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = squareSize + dist;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareSize, squareSize);
        return patternCanvas;
      };

      //diamond pattern
      const diamond = new PatternBrush(canvas);
      diamond.getPatternSrc = function () {
        const squareSize = 10;
        const dist = 5;
        // Create a rectangle, rotate it 45 and draw
        const rect = new fabric.Rect({
          width: squareSize,
          height: squareSize,
          angle: 45,
          fill: this.color,
        });
        const canvasSize = rect.getBoundingRect().width;
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = canvasSize + dist;
        rect.set({ left: canvasSize / 2, top: canvasSize / 2 });
        const ctx = patternCanvas.getContext("2d")!;
        rect.render(ctx);
        return patternCanvas;
      };

      //save pattern brush with keys, which user can select
      brushesRef.current = { hline: vLine, vline: hLine, square, diamond };
    }

    //default brush
    canvas.freeDrawingBrush = new (fabric as any).PencilBrush(canvas);

    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.calcOffset();

    return () => {
      canvas.dispose();
    };
  }, []);

  //refresh canvas drawing regime, when changes drawingMode state
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.isDrawingMode = drawingMode;
    }
  }, [drawingMode]);

  //select brush type after brushType state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (brushType in brushesRef.current) {
      //if selected pattern brush
      canvas.freeDrawingBrush = brushesRef.current[brushType];
    } else {
      //simple brushes: pencilBrush, etc...
      const Brush = (fabric as any)[brushType + "Brush"];
      if (Brush) {
        canvas.freeDrawingBrush = new Brush(canvas);
      }
    }
  }, [brushType]);

  //refresh color, width, shadow settings
  useEffect(() => {
    const brush = canvasRef.current?.freeDrawingBrush as any;
    if (!brush) return;
    brush.color = color; // line color
    brush.width = lineWidth; // line thickness
    // shadow settings: blur, color, displacement
    brush.shadow = new fabric.Shadow({
      blur: shadowWidth,
      offsetX: shadowOffset,
      offsetY: shadowOffset,
      affectStroke: true,
      color: shadowColor,
    });
  }, [color, lineWidth, shadowWidth, shadowOffset, shadowColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setWidth(width);
    canvas.setHeight(height);
    canvas.calcOffset();
    canvas.renderAll();
  }, [width, height]);

  return (
    <div className="p-4">
      {/* Control header */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-1 bg-[#3d3e42] bg-opacity-50 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          {/* Drawing regime */}
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className="px-3 py-2 bg-primary text-gray-100 text-sm rounded-lg hover:bg-primary-dark transition"
            title={drawingMode ? "Cancel drawing" : "Draw"}
          >
            {drawingMode ? "Cancel" : "Draw"}
          </button>

          {/* Clear btn */}
          <button
            onClick={() => canvasRef.current?.clear()}
            className="p-2 bg-secondary text-gray-100 rounded-lg hover:bg-orange-700 transition"
            title="Clear"
          >
            <RiDeleteBin6Line size={20} />
          </button>

          {/* Brush list */}
          <select
            value={brushType}
            onChange={(e) => setBrushType(e.target.value)}
            className="text-sm p-2 bg-main text-gray-100 rounded-lg border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-sky-500"
            title="Choose a brush"
          >
            <option value="Pencil">Pencil</option>
            <option value="Circle">Circle</option>
            <option value="Spray">Spray</option>
            <option value="hline">Horizontal line</option>
            <option value="vline">Vertical line</option>
            <option value="square">Square</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4 ">
          {/* Color */}
          <label className="flex items-center text-gray-200 text-xs">
            <span className="mr-1">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 p-0 border-0"
              title="Line color"
            />
          </label>
          <label className="flex items-center text-gray-200 text-xs">
            <span className="mr-1">Shadow:</span>
            <input
              type="color"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-6 h-6 p-0 border-0"
              title="Shadow color"
            />
          </label>

          {/* sliders */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs  text-gray-200">
              Width: {lineWidth}
              <input
                type="range"
                min="1"
                max="50"
                value={lineWidth}
                onChange={(e) => setLineWidth(+e.target.value)}
                className="mx-2 h-1 w-24 appearance-none align-middle accent-indigo-500 rounded-full"
                title="Line width"
              />
            </label>

            <label className="text-xs text-gray-200">
              Shadow W: {shadowWidth}
              <input
                type="range"
                min="0"
                max="50"
                value={shadowWidth}
                onChange={(e) => setShadowWidth(+e.target.value)}
                className="mx-2 h-1 w-24 appearance-none align-middle accent-indigo-500 rounded-full"
                title="Shadow width"
              />
            </label>

            <label className="text-xs text-gray-200">
              Offset: {shadowOffset}
              <input
                type="range"
                min="0"
                max="50"
                value={shadowOffset}
                onChange={(e) => setShadowOffset(+e.target.value)}
                className="mx-2 h-1 w-24 appearance-none align-middle accent-indigo-500 rounded-full"
                title="Shadow offset"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Drawing canvas */}
      <div className="rounded-xl overflow-hidden ">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
};

export default FabricDrawing;
