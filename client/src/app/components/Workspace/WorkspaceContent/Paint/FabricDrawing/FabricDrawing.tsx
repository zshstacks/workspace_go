import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { FabricProps } from "@/app/utility/types/componentTypes";

import { RiDeleteBin6Line } from "react-icons/ri";

type BrushCtor = new (canvas: fabric.Canvas) => fabric.BaseBrush;

type PatternBrushInstance = fabric.BaseBrush & {
  getPatternSrc?: () => HTMLCanvasElement;
  color: string;
};

interface FabricObjectPrototype {
  transparentCorners?: boolean;
}

interface FabricWithObject {
  Object: {
    prototype: FabricObjectPrototype;
  };
}

interface FabricWithFabricObject {
  FabricObject: {
    prototype: FabricObjectPrototype;
  };
}

interface FabricCtors {
  PencilBrush?: BrushCtor;
  CircleBrush?: BrushCtor;
  SprayBrush?: BrushCtor;
  PatternBrush?: new (canvas: fabric.Canvas) => PatternBrushInstance;
}

interface ExtendedBrush extends fabric.BaseBrush {
  color: string;
  width: number;
  shadow: fabric.Shadow | null;
}

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
  const brushesRef = useRef<
    Record<string, fabric.BaseBrush | PatternBrushInstance>
  >({});

  const initialDrawingModeRef = useRef<boolean>(drawingMode);
  const initialWidthRef = useRef<number>(width);
  const initialHeightRef = useRef<number>(height);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      isDrawingMode: initialDrawingModeRef.current,
    });
    canvasRef.current = canvas;

    // Type-safe transparentCorners
    const fabricWithObject = fabric as unknown as FabricWithObject;
    const fabricWithFabricObject = fabric as unknown as FabricWithFabricObject;

    if (fabricWithObject.Object?.prototype) {
      fabricWithObject.Object.prototype.transparentCorners = false;
    } else if (fabricWithFabricObject.FabricObject?.prototype) {
      fabricWithFabricObject.FabricObject.prototype.transparentCorners = false;
    }

    // Type-safe Fabric
    const fabricCtors = fabric as unknown as FabricCtors;

    // PatternBrush
    if (fabricCtors.PatternBrush) {
      const PatternBrushCtor = fabricCtors.PatternBrush;

      // vertical line
      const vLine = new PatternBrushCtor(canvas);
      vLine.getPatternSrc = function (this: PatternBrushInstance) {
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.strokeStyle = this.color ?? "#000";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.stroke();
        return patternCanvas;
      };

      // horizontal line
      const hLine = new PatternBrushCtor(canvas);
      hLine.getPatternSrc = function (this: PatternBrushInstance) {
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = 10;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.strokeStyle = this.color ?? "#000";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.stroke();
        return patternCanvas;
      };

      // square
      const square = new PatternBrushCtor(canvas);
      square.getPatternSrc = function (this: PatternBrushInstance) {
        const squareSize = 10;
        const dist = 2;
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = squareSize + dist;
        const ctx = patternCanvas.getContext("2d")!;
        ctx.fillStyle = this.color ?? "#000";
        ctx.fillRect(0, 0, squareSize, squareSize);
        return patternCanvas;
      };

      // diamond
      const diamond = new PatternBrushCtor(canvas);
      diamond.getPatternSrc = function (this: PatternBrushInstance) {
        const squareSize = 10;
        const dist = 5;
        const rect = new fabric.Rect({
          width: squareSize,
          height: squareSize,
          angle: 45,
          fill: this.color ?? "#000",
          originX: "center",
          originY: "center",
        });
        const canvasSize = rect.getBoundingRect().width;
        const patternCanvas = fabric.util.createCanvasElement();
        patternCanvas.width = patternCanvas.height = canvasSize + dist;
        rect.set({
          left: patternCanvas.width / 2,
          top: patternCanvas.height / 2,
        });
        const ctx = patternCanvas.getContext("2d")!;
        rect.render(ctx);
        return patternCanvas;
      };

      brushesRef.current = { hline: vLine, vline: hLine, square, diamond };
    }

    // Default pencil brush
    const PencilBrushCtor = fabricCtors.PencilBrush;
    if (PencilBrushCtor) {
      canvas.freeDrawingBrush = new PencilBrushCtor(canvas);
    } else {
      // Fallback ar precīzāku tipu
      const fabricWithBrushes = fabric as Record<string, unknown>;
      const FallbackPencil = fabricWithBrushes.PencilBrush as
        | BrushCtor
        | undefined;
      if (FallbackPencil) {
        canvas.freeDrawingBrush = new FallbackPencil(canvas);
      }
    }

    canvas.setWidth(initialWidthRef.current);
    canvas.setHeight(initialHeightRef.current);
    canvas.calcOffset();

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  // Refresh canvas drawing mode
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.isDrawingMode = drawingMode;
    }
  }, [drawingMode]);

  // Select brush type
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // check if saved pattern brush
    const stored = brushesRef.current[brushType];
    if (stored) {
      canvas.freeDrawingBrush = stored;
      return;
    }

    // choosed default brush
    const fabricCtors = fabric as unknown as FabricCtors;
    const ctorName = (brushType + "Brush") as keyof FabricCtors;
    const Ctor = fabricCtors[ctorName] as BrushCtor | undefined;
    if (Ctor) {
      canvas.freeDrawingBrush = new Ctor(canvas);
    }
  }, [brushType]);

  // Refresh brush settings
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.freeDrawingBrush) return;

    const brush = canvas.freeDrawingBrush as ExtendedBrush;

    if ("color" in brush) {
      brush.color = color;
    }
    if ("width" in brush) {
      brush.width = lineWidth;
    }

    // Shadow
    const shadow = new fabric.Shadow({
      blur: shadowWidth,
      offsetX: shadowOffset,
      offsetY: shadowOffset,
      affectStroke: true,
      color: shadowColor,
    });

    if ("shadow" in brush) {
      brush.shadow = shadow;
    }
  }, [color, lineWidth, shadowWidth, shadowOffset, shadowColor]);

  // Canvas size
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
      <div className="flex flex-wrap items-center gap-3 mb-4 p-1 bg-[#3d3e42] dark:bg-opacity-30 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          {/* Drawing mode toggle */}
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className="px-3 py-2 bg-primary text-sm rounded-lg hover:bg-primary-dark transition"
            title={drawingMode ? "Cancel drawing" : "Draw"}
          >
            {drawingMode ? "Cancel" : "Draw"}
          </button>

          {/* Clear button */}
          <button
            onClick={() => canvasRef.current?.clear()}
            className="p-2 bg-secondary rounded-lg hover:bg-orange-700 transition"
            title="Clear"
          >
            <RiDeleteBin6Line size={20} />
          </button>

          {/* Brush selector */}
          <select
            value={brushType}
            onChange={(e) => setBrushType(e.target.value)}
            className="text-sm p-2 bg-main dark:bg-lightMain/65 rounded-lg border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-sky-500 cursor-pointer"
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

        <div className="flex flex-wrap items-center gap-4">
          {/* Color controls */}
          <label className="flex items-center text-xs">
            <span className="mr-1">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 p-0 border-0"
              title="Line color"
            />
          </label>
          <label className="flex items-center text-xs">
            <span className="mr-1">Shadow:</span>
            <input
              type="color"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-6 h-6 p-0 border-0"
              title="Shadow color"
            />
          </label>

          {/* Sliders */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs">
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

            <label className="text-xs">
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

            <label className="text-xs">
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
      <div className="rounded-xl overflow-hidden shadow-inner shadow-black">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
};

export default FabricDrawing;
