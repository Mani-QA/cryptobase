
import React, { useEffect, useRef } from "react";
import { Coin } from "@/utils/api";

interface DistributionChartProps {
  coins: Coin[];
  size?: number;
  innerRadius?: number;
  className?: string;
}

const DistributionChart: React.FC<DistributionChartProps> = ({
  coins,
  size = 250,
  innerRadius = 0.6,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // Draw donut chart segments
    let startAngle = -Math.PI / 2; // Start at top (12 o'clock position)
    
    sortedCoins.forEach((coin, index) => {
      if (!coin.total_value) return;
      
      const value = coin.total_value;
      const portionOfTotal = value / totalValue;
      const angleSize = portionOfTotal * Math.PI * 2;
      const endAngle = startAngle + angleSize;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      
      // Fill with color
      ctx.fillStyle = colorPalette[index % colorPalette.length];
      ctx.fill();
      
      startAngle = endAngle;
    });

    // Draw inner circle (donut hole)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadiusValue, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim();
    ctx.fill();
  }, [coins, size, innerRadius]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`distribution-chart ${className}`}
    />
  );
};

export default DistributionChart;
