import React, { useRef, useEffect } from "react";
import type { OptimizationResult } from "../types";

interface OptimizationVisualizationProps {
  result: OptimizationResult;
  unit: string;
}

const OptimizationVisualization: React.FC<OptimizationVisualizationProps> = ({
  result,
  unit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const labelColors: Record<string, string> = {};
  let colorIndex = 0;

  // Generate colors for cuts
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#84cc16",
  ];

  // On génère toutes les couleurs à l'avance en fonction des labels
  result.optimizedPlanks.forEach((plank) => {
    plank.placements.forEach((placement) => {
      const label =
        placement.cut.label || `${placement.cut.length}×${placement.cut.width}`;
      if (!labelColors[label]) {
        labelColors[label] = colors[colorIndex % colors.length];
        colorIndex++;
      }
    });
  });

  useEffect(() => {
    if (!canvasRef.current || result.optimizedPlanks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit planks
    const maxPlankLength = Math.max(
      ...result.optimizedPlanks.map((p) => p.plank.length)
    );
    const maxPlankWidth = Math.max(
      ...result.optimizedPlanks.map((p) => p.plank.width)
    );

    // Set canvas size
    const tempContainerWidth = canvas.parentElement?.clientWidth || 800;
    const containerWidth = tempContainerWidth;
    canvas.width = containerWidth - 10;
    canvas.height =
      result.optimizedPlanks.length === 1
        ? Math.max(
            maxPlankLength > maxPlankWidth ? maxPlankWidth : maxPlankLength
          )
        : Math.max(maxPlankWidth * 2 * result.optimizedPlanks.length);

    const scale = Math.min((containerWidth - 100) / maxPlankLength);

    let yOffset = 20;

    result.optimizedPlanks.forEach((optimizedPlank, index) => {
      const plank = optimizedPlank.plank;
      const plankWidth = plank.length * scale;
      const plankHeight = plank.width * scale;
      const x = 50;
      const y = yOffset;

      // Draw plank background
      ctx.fillStyle = "#d2b48c";
      ctx.fillRect(x, y, plankWidth, plankHeight);
      ctx.strokeStyle = "#8b4513";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, plankWidth, plankHeight);

      // Draw plank label
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.fillText(
        `Plank ${index + 1}      L:${plank.length}   l: ${plank.width}   t: ${
          plank.thickness
        })`,
        x,
        y - 5
      );

      // Draw efficiency
      ctx.font = "12px Arial";
      ctx.fillStyle =
        optimizedPlank.efficiency > 70
          ? "#16a34a"
          : optimizedPlank.efficiency > 50
          ? "#eab308"
          : "#dc2626";
      // ctx.fillText(
      //   `Efficiency: ${optimizedPlank.efficiency.toFixed(1)}%`,
      //   x + plankWidth - 120,
      //   y - 5
      // );

      // Draw cuts
      optimizedPlank.placements.forEach((placement, cutIndex) => {
        const cut = placement.cut;
        const cutLength = placement.rotated ? cut.width : cut.length;
        const cutWidth = placement.rotated ? cut.length : cut.width;

        const cutX = x + placement.x * scale;
        const cutY = y + placement.y * scale;
        const cutDrawWidth = cutLength * scale;
        const cutDrawHeight = cutWidth * scale;

        // Draw cut
        const label = cut.label || `${cut.length}×${cut.width}`;
        ctx.fillStyle = labelColors[label] + "80"; // semi-transparent
        ctx.fillRect(cutX, cutY, cutDrawWidth, cutDrawHeight);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(cutX, cutY, cutDrawWidth, cutDrawHeight);

        // Draw cut label
        if (cutDrawWidth > 40 && cutDrawHeight > 20) {
          ctx.fillStyle = "#000";
          ctx.font = "10px Arial";
          const label = cut.label || `${cut.length}×${cut.width}`;
          const textWidth = ctx.measureText(label).width;

          if (textWidth < cutDrawWidth - 4) {
            ctx.fillText(
              label,
              cutX + (cutDrawWidth - textWidth) / 2,
              cutY + cutDrawHeight / 2 + 3
            );
          }
        }

        // Draw rotation indicator
        if (placement.rotated && cutDrawWidth > 20 && cutDrawHeight > 20) {
          ctx.fillStyle = "#000";
          ctx.font = "8px Arial";
          ctx.fillText("R", cutX + 2, cutY + 10);
        }
      });

      yOffset += plankHeight + 40;
    });

    // Build a unique legend
    const legendItems: { label: string; color: string }[] = [];
    const usedLabels = new Set<string>();

    result.optimizedPlanks.forEach((plank) => {
      plank.placements.forEach((placement) => {
        const label =
          placement.cut.label ||
          `${placement.cut.length}×${placement.cut.width}`;
        if (!usedLabels.has(label)) {
          usedLabels.add(label);
          legendItems.push({
            label,
            color: labelColors[label],
          });
        }
      });
    });

    // Draw legend
    if (legendItems.length > 0) {
      const legendY = yOffset + 20;
      ctx.fillStyle = "#000";
      ctx.font = "12px Arial";
      ctx.fillText("Legend:", 50, legendY);

      let legendX = 50;
      let legendItemY = legendY + 20;

      // Tri alphabétique par label
      legendItems.sort((a, b) => a.label.localeCompare(b.label));

      legendItems.forEach((item) => {
        ctx.fillStyle = item.color + "80"; // même transparence que les rectangles
        ctx.fillRect(legendX, legendItemY - 10, 15, 10);

        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.fillText(item.label, legendX + 20, legendItemY - 2);

        legendX += ctx.measureText(item.label).width + 40;
        if (legendX > containerWidth - 100) {
          legendX = 50;
          legendItemY += 20;
        }
      });
    }
  }, [result, unit]);

  if (result.optimizedPlanks.length === 0) {
    return (
      <div className="p-8 text-center card">
        <p className="text-gray-500 dark:text-gray-400">
          No optimization results to display. Run the optimizer first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-0 card">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        Cutting Diagram
      </h3>
      <div className="overflow-x-auto">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded dark:border-gray-600 min-h-fit"
          style={{ maxWidth: "full", height: "auto" }}
        />
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>• Each colored rectangle represents a cut piece</p>
        <p>• "R" indicates the piece should be rotated</p>
        <p>• Brown areas show unused wood (waste)</p>
      </div>
    </div>
  );
};

export default OptimizationVisualization;
