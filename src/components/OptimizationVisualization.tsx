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

  // Palette de couleurs
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

  // Attribution des couleurs aux labels
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

  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  useEffect(() => {
    if (!canvasRef.current || result.optimizedPlanks.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const marginX = 50;
    const marginY = 50;
    const spacingY = 20;

    const maxPlankLength = Math.max(
      ...result.optimizedPlanks.map((p) => p.plank.length)
    );
    const totalPlankHeight = result.optimizedPlanks.reduce(
      (sum, p) => sum + p.plank.width,
      0
    );

    const availableHeight = window.innerHeight * 0.8 - marginY * 2;
    const totalPlankHeightWithSpacing =
      totalPlankHeight + spacingY * (result.optimizedPlanks.length - 1);
    const scale =
      totalPlankHeightWithSpacing > availableHeight
        ? availableHeight / totalPlankHeightWithSpacing
        : 1;

    const containerWidth = canvas.parentElement?.clientWidth || 800;
    canvas.width = Math.max(
      containerWidth,
      maxPlankLength * scale + marginX * 2
    );
    canvas.height =
      totalPlankHeight * scale +
      spacingY * (result.optimizedPlanks.length - 1) +
      marginY * 2 +
      80; // Espace pour la légende

    // Nettoyage
    ctx.fillStyle = isDarkMode ? "#1f2937" : "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let yOffset = marginY;

    // Dessin des planches
    result.optimizedPlanks.forEach((optimizedPlank, index) => {
      const plank = optimizedPlank.plank;
      const plankWidth = plank.length * scale;
      const plankHeight = plank.width * scale;
      const x = marginX;
      const y = yOffset;

      // Plank background
      ctx.fillStyle = "#d2b48c";
      ctx.fillRect(x, y, plankWidth, plankHeight);
      ctx.strokeStyle = "#8b4513";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, plankWidth, plankHeight);

      // Label planche
      ctx.fillStyle = isDarkMode ? "#fff" : "#000";
      ctx.font = "14px Arial";
      ctx.fillText(
        `Plank ${index + 1}  L:${plank.length} l:${plank.width} t:${
          plank.thickness
        }`,
        x,
        y - 5
      );

      // Dessin des cuts
      optimizedPlank.placements.forEach((placement) => {
        const cut = placement.cut;
        const cutLength = placement.rotated ? cut.width : cut.length;
        const cutWidth = placement.rotated ? cut.length : cut.width;

        const cutX = x + placement.x * scale;
        const cutY = y + placement.y * scale;
        const cutDrawWidth = cutLength * scale;
        const cutDrawHeight = cutWidth * scale;

        const label = cut.label || `${cut.length}×${cut.width}`;
        ctx.fillStyle = labelColors[label] + "80";
        ctx.fillRect(cutX, cutY, cutDrawWidth, cutDrawHeight);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.strokeRect(cutX, cutY, cutDrawWidth, cutDrawHeight);

        if (cutDrawWidth > 40 && cutDrawHeight > 20) {
          ctx.fillStyle = isDarkMode ? "#fff" : "#000";
          ctx.font = "10px Arial";
          const textWidth = ctx.measureText(label).width;
          if (textWidth < cutDrawWidth - 4) {
            ctx.fillText(
              label,
              cutX + (cutDrawWidth - textWidth) / 2,
              cutY + cutDrawHeight / 2 + 3
            );
          }
        }

        if (placement.rotated && cutDrawWidth > 20 && cutDrawHeight > 20) {
          ctx.fillStyle = isDarkMode ? "#fff" : "#000";
          ctx.font = "8px Arial";
          ctx.fillText("R", cutX + 2, cutY + 10);
        }
      });

      // Calcul du gaspillage en prenant en compte largeur et longueur
      const usedRight = Math.max(
        ...optimizedPlank.placements.map(
          (p) => p.x + (p.rotated ? p.cut.width : p.cut.length)
        )
      );
      const usedBottom = Math.max(
        ...optimizedPlank.placements.map(
          (p) => p.y + (p.rotated ? p.cut.length : p.cut.width)
        )
      );

      // Waste à droite
      if (usedRight < plank.length) {
        const wasteX = x + usedRight * scale;
        const wasteY = y;
        const wasteWidth = (plank.length - usedRight) * scale;
        const wasteHeight = plank.width * scale;

        // Dessin du rectangle de waste
        ctx.fillStyle = "#deb887";
        ctx.fillRect(wasteX, wasteY, wasteWidth, wasteHeight);
        ctx.strokeStyle = "#8b4513";
        ctx.strokeRect(wasteX, wasteY, wasteWidth, wasteHeight);

        // Texte annotation
        const text = `${(plank.length - usedRight).toFixed(
          0
        )} × ${plank.width.toFixed(0)}`;
        ctx.fillStyle = isDarkMode ? "#fff" : "#000";
        ctx.font = "12px Arial";

        // Coordonnées pour le centre du rectangle
        const centerX = wasteX + wasteWidth / 2;
        const centerY = wasteY + wasteHeight / 2;

        ctx.save(); // sauvegarde l'état du contexte
        ctx.translate(centerX, centerY); // se déplacer au centre du rectangle
        ctx.rotate(-Math.PI / 2); // rotation 90° vers la gauche
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, -textWidth / 2, 4); // centrage horizontal et léger ajustement vertical
        ctx.restore(); // rétablir l'état du contexte
      }

      // Waste en bas
      if (usedBottom < plank.width) {
        const wasteX = x;
        const wasteY = y + usedBottom * scale;
        const wasteWidth = plank.length * scale;
        const wasteHeight = (plank.width - usedBottom) * scale;

        ctx.fillStyle = "#deb8870f";
        ctx.fillRect(wasteX, wasteY, wasteWidth, wasteHeight);
        ctx.strokeStyle = "#8b451304";
        ctx.strokeRect(wasteX, wasteY, wasteWidth, wasteHeight);

        // Texte annotation
        const text = `${plank.length.toFixed(0)} × ${(
          plank.width - usedBottom
        ).toFixed(0)}`;
        ctx.fillStyle = isDarkMode ? "#fff" : "#000";
        ctx.font = "12px Arial";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(
          text,
          wasteX + (wasteWidth - textWidth) / 2,
          wasteY + wasteHeight / 2 + 4
        );
      }

      yOffset += plankHeight + spacingY;
    });

    // --- Légende ---
    const legendItems: { label: string; color: string }[] = [];
    const usedLabels = new Set<string>();
    result.optimizedPlanks.forEach((plank) => {
      plank.placements.forEach((placement) => {
        const label =
          placement.cut.label ||
          `${placement.cut.length}×${placement.cut.width}`;
        if (!usedLabels.has(label)) {
          usedLabels.add(label);
          legendItems.push({ label, color: labelColors[label] });
        }
      });
    });

    if (legendItems.length > 0) {
      const legendY = yOffset + 20;
      ctx.fillStyle = isDarkMode ? "#fff" : "#000";
      ctx.font = "12px Arial";
      ctx.fillText("Legend:", marginX, legendY);

      let legendX = marginX;
      let legendItemY = legendY + 20;
      legendItems.sort((a, b) => a.label.localeCompare(b.label));

      legendItems.forEach((item) => {
        ctx.fillStyle = item.color + "80";
        ctx.fillRect(legendX, legendItemY - 10, 15, 10);
        ctx.fillStyle = isDarkMode ? "#fff" : "#000";
        ctx.font = "10px Arial";
        ctx.fillText(item.label, legendX + 20, legendItemY - 2);

        legendX += ctx.measureText(item.label).width + 40;
        if (legendX > canvas.width - marginX - 100) {
          legendX = marginX;
          legendItemY += 20;
        }
      });
    }
  }, [result, unit, isDarkMode]);

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
      <div className="overflow-auto">
        <canvas
          ref={canvasRef}
          className="w-full border border-gray-200 rounded dark:border-gray-600"
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
