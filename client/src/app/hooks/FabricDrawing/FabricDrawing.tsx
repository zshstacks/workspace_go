import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { FabricProps } from "@/app/utility/types/componentTypes";

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
    <div className="p-2">
      {/* Compact control panel */}
      <div className="flex flex-wrap items-center gap-1 mb-2  p-2 rounded">
        <div className="flex items-center gap-1">
          {/* Drawing mode toggle */}
          <button
            onClick={() => setDrawingMode(!drawingMode)}
            className="px-2 py-1 bg-blue-500 text-white text-sm rounded-md"
            title={drawingMode ? "Cancel drawing" : "Draw"}
          >
            {drawingMode ? "Cancel" : "Draw"}
          </button>

          {/* Clear button */}
          <button
            onClick={() => canvasRef.current?.clear()}
            className="px-2 py-1 bg-red-500 text-white text-sm rounded-md"
            title="Clear canvas"
          >
            Clear
          </button>

          {/* Brush types dropdown */}
          <select
            value={brushType}
            onChange={(e) => setBrushType(e.target.value)}
            className="border text-sm p-1 rounded-md h-7"
            title="Select brush type"
          >
            <option value="Pencil">Pencil</option>
            <option value="Circle">Circle</option>
            <option value="Spray">Spray</option>
            <option value="hline">H-Line</option>
            <option value="vline">V-Line</option>
            <option value="square">Square</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {/* Color pickers */}
          <div className="flex items-center gap-1">
            <label className="text-xs flex items-center">
              <span className="mr-1">Color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6"
                title="Line color"
              />
            </label>

            <label className="text-xs flex items-center">
              <span className="mr-1">Shadow:</span>
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="w-6 h-6"
                title="Shadow color"
              />
            </label>
          </div>

          {/* Sliders with compact labels */}
          <div className="flex flex-wrap items-center gap-1">
            <label className="text-xs flex items-center">
              <span className="mr-1">Width:</span>
              <input
                type="range"
                min="1"
                max="50"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value, 10))}
                className="w-20 h-4"
                title="Line width"
              />
              <span className="ml-1 text-xs w-5">{lineWidth}</span>
            </label>

            <label className="text-xs flex items-center">
              <span className="mr-1">Shadow W:</span>
              <input
                type="range"
                min="0"
                max="50"
                value={shadowWidth}
                onChange={(e) => setShadowWidth(parseInt(e.target.value, 10))}
                className="w-20 h-4"
                title="Shadow width"
              />
              <span className="ml-1 text-xs w-5">{shadowWidth}</span>
            </label>

            <label className="text-xs flex items-center">
              <span className="mr-1">Offset:</span>
              <input
                type="range"
                min="0"
                max="50"
                value={shadowOffset}
                onChange={(e) => setShadowOffset(parseInt(e.target.value, 10))}
                className="w-20 h-4"
                title="Shadow offset"
              />
              <span className="ml-1 text-xs w-5">{shadowOffset}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasElRef} className="flex-1" />
    </div>
  );
};

export default FabricDrawing;
