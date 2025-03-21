
import { useRef, useEffect } from "react";

interface SparklineChartProps {
  data: number[];
  color: string;
  height?: number;
  width?: string;
  lineWidth?: number;
  isPositive?: boolean;
  className?: string;
  fillOpacity?: number;
}

const SparklineChart = ({
  data,
  color,
  height = 40,
  width = "100%",
  lineWidth = 1.5,
  isPositive = true,
  className = "",
  fillOpacity = 0.2,
}: SparklineChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle device pixel ratio for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Find min and max in data for scaling
    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);
    const range = maxValue - minValue;
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw sparkline
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;

    // Calculate point positions
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * rect.width;
      const normalizedValue = range === 0 ? 0.5 : (value - minValue) / range;
      const y = rect.height - normalizedValue * (rect.height - 4) - 2; // Small padding

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Optional fill
    if (fillOpacity > 0) {
      // Continue path to bottom right and back to bottom left to close
      const lastIndex = data.length - 1;
      const lastX = rect.width;
      const lastY = rect.height - ((range === 0 ? 0.5 : (data[lastIndex] - minValue) / range) * (rect.height - 4)) - 2;
      
      ctx.lineTo(lastX, lastY);
      ctx.lineTo(lastX, rect.height);
      ctx.lineTo(0, rect.height);
      ctx.closePath();
      
      ctx.fillStyle = `${color}${Math.round(fillOpacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    }
  }, [data, color, height, lineWidth, isPositive, fillOpacity]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      style={{ width, height }}
      className={`sparkline ${className}`}
    />
  );
};

export default SparklineChart;
