
import React, { useEffect, useRef, useState } from "react";
import { Coin } from "@/utils/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPercentage } from "@/utils/formatters";

interface DistributionChartProps {
  coins: Coin[];
  size?: number;
  innerRadius?: number;
  className?: string;
  currencyType?: 'USD' | 'CAD' | 'INR';
}

interface ChartSegment {
  coin: Coin;
  startAngle: number;
  endAngle: number;
  percentage: number;
  color: string;
}

const DistributionChart: React.FC<DistributionChartProps> = ({
  coins,
  size = 250,
  innerRadius = 0.6,
  className = "",
  currencyType = 'USD',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [segments, setSegments] = useState<ChartSegment[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<ChartSegment | null>(null);

  // Draw the chart
  useEffect(() => {
    if (!canvasRef.current || !coins.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle device pixel ratio for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    // Calculate total value
    const totalValue = coins.reduce(
      (sum, coin) => sum + (coin.total_value || 0),
      0
    );

    if (totalValue <= 0) return;

    // Define color palette (pastel colors)
    const colorPalette = [
      "#3b82f6", // blue
      "#8b5cf6", // purple
      "#ec4899", // pink
      "#ef4444", // red
      "#f97316", // orange
      "#f59e0b", // amber
      "#10b981", // emerald
      "#06b6d4", // cyan
      "#6366f1", // indigo
      "#a855f7", // violet
    ];

    // Calculate center point
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY);
    const innerRadiusValue = radius * innerRadius;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Sort coins by value (largest first)
    const sortedCoins = [...coins]
      .filter((coin) => (coin.total_value || 0) > 0)
      .sort((a, b) => (b.total_value || 0) - (a.total_value || 0));

    // Draw donut chart segments and store segment data
    let startAngle = -Math.PI / 2; // Start at top (12 o'clock position)
    const newSegments: ChartSegment[] = [];
    
    sortedCoins.forEach((coin, index) => {
      if (!coin.total_value) return;
      
      const value = coin.total_value;
      const portionOfTotal = value / totalValue;
      const percentage = portionOfTotal * 100;
      const angleSize = portionOfTotal * Math.PI * 2;
      const endAngle = startAngle + angleSize;
      const color = colorPalette[index % colorPalette.length];
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      // Fill with color
      ctx.fillStyle = color;
      ctx.fill();
      
      // Store segment data
      newSegments.push({
        coin,
        startAngle,
        endAngle,
        percentage,
        color
      });
      
      startAngle = endAngle;
    });
    
    setSegments(newSegments);

    // Draw inner circle (donut hole)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadiusValue, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim();
    ctx.fill();
  }, [coins, size, innerRadius]);

  // Handle mouse move for tooltips
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || segments.length === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY);
    const innerRadiusValue = radius * innerRadius;
    
    // Calculate distance from center
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If inside the donut (not in the hole and not outside)
    if (distance > innerRadiusValue && distance < radius) {
      // Calculate angle of mouse position
      let angle = Math.atan2(dy, dx);
      
      // Adjust angle to match chart starting position (-π/2 or 12 o'clock)
      if (angle < -Math.PI / 2) {
        angle += Math.PI * 2;
      }
      
      // Find segment that contains this angle
      const segment = segments.find(seg => {
        const adjustedStartAngle = seg.startAngle < -Math.PI / 2 ? seg.startAngle + Math.PI * 2 : seg.startAngle;
        const adjustedEndAngle = seg.endAngle < -Math.PI / 2 ? seg.endAngle + Math.PI * 2 : seg.endAngle;
        return angle >= adjustedStartAngle && angle <= adjustedEndAngle;
      });
      
      setHoveredSegment(segment || null);
    } else {
      setHoveredSegment(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  return (
    <TooltipProvider>
      <Tooltip open={!!hoveredSegment}>
        <TooltipTrigger asChild>
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className={`distribution-chart ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </TooltipTrigger>
        {hoveredSegment && (
          <TooltipContent className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: hoveredSegment.color }}
              />
              <span className="font-medium">{hoveredSegment.coin.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatPercentage(hoveredSegment.percentage, 1)} of portfolio
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default DistributionChart;
