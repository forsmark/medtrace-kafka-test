import React, { useRef, useEffect, useState, MouseEvent } from "react";

interface Point {
  x: number;
  y: number;
}

interface DraggableCanvasProps {
  circleRadius: number;
  onPointDrag?: (x: number, y: number) => void;
}

const DraggableCanvas: React.FC<DraggableCanvasProps> = ({
  circleRadius,
  onPointDrag,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [point, setPoint] = useState<Point>({ x: 100, y: 100 });
  const circleColor = "#a855f7"; // Tailwind purple-500
  const pointColor = "#a855f7";

  // Draw the circle and point on the canvas
  const draw = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Draw the circle with specified radius
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = circleColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw the draggable point
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = pointColor;
    ctx.fill();
  };

  // Redraw whenever the point or circleRadius changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx, point.x, point.y);
    }
  }, [point, circleRadius]);

  // Check if (x, y) is inside the circle
  const isInsideCircle = (x: number, y: number): boolean => {
    const dx = x - point.x;
    const dy = y - point.y;
    return Math.sqrt(dx * dx + dy * dy) <= circleRadius;
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (isInsideCircle(x, y)) {
      setDragging(true);
      canvas.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (dragging) {
      setPoint({ x, y });
      if (onPointDrag) onPointDrag(x, y);
      canvas.style.cursor = "grabbing";
    } else {
      canvas.style.cursor = isInsideCircle(x, y) ? "pointer" : "default";
    }
  };

  const handleMouseUp = (): void => {
    setDragging(false);
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  };

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="bg-gray-900 border border-gray-600 rounded"
    />
  );
};

export default DraggableCanvas;
