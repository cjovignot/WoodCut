import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Project, OptimizationResult } from "../types";

export const exportProjectAsJSON = (project: Project) => {
  const dataStr = JSON.stringify(project, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `${project.name.replace(/\s+/g, "_")}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};

export const exportProjectAsCSV = (project: Project) => {
  let csv = "Type,ID,Length,Width,Thickness,Material,Quantity,Label\n";

  // Add planks
  project.planks.forEach((plank) => {
    csv += `Plank,${plank.id},${plank.length},${plank.width},${plank.thickness},${plank.material},${plank.quantity},\n`;
  });

  // Add cuts
  project.cuts.forEach((cut) => {
    csv += `Cut,${cut.id},${cut.length},${cut.width},${cut.thickness},,${
      cut.quantity
    },${cut.label || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("hidden", "");
  a.setAttribute("href", url);
  a.setAttribute("download", `${project.name.replace(/\s+/g, "_")}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const exportOptimizationAsPDF = async (
  project: Project,
  result: OptimizationResult,
  visualizationElement?: HTMLElement
) => {
  const pdf = new jsPDF();
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text(`WoodCut Optimization Report`, 20, yPosition);
  yPosition += 15;

  // Project info
  pdf.setFontSize(14);
  pdf.text(`Project: ${project.name}`, 20, yPosition);
  yPosition += 10;

  if (project.description) {
    pdf.setFontSize(10);
    pdf.text(`Description: ${project.description}`, 20, yPosition);
    yPosition += 10;
  }

  // Statistics
  pdf.setFontSize(12);
  pdf.text("Optimization Results:", 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.text(`Planks Used: ${result.planksUsed}`, 25, yPosition);
  yPosition += 6;
  pdf.text(
    `Total Efficiency: ${result.totalEfficiency.toFixed(1)}%`,
    25,
    yPosition
  );
  yPosition += 6;
  pdf.text(
    `Total Waste: ${result.totalWaste.toFixed(2)} sq units`,
    25,
    yPosition
  );
  yPosition += 10;

  // Cutting instructions
  pdf.setFontSize(12);
  pdf.text("Cutting Instructions:", 20, yPosition);
  yPosition += 8;

  result.optimizedPlanks.forEach((optimizedPlank, plankIndex) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(10);
    pdf.text(
      `Plank ${plankIndex + 1} (${optimizedPlank.plank.length} x ${
        optimizedPlank.plank.width
      } x ${optimizedPlank.plank.thickness})`,
      25,
      yPosition
    );
    yPosition += 6;

    optimizedPlank.placements.forEach((placement, cutIndex) => {
      const cut = placement.cut;
      const rotatedText = placement.rotated ? " (rotated)" : "";
      pdf.text(
        `  Cut ${cutIndex + 1}: ${cut.length} x ${
          cut.width
        } at position (${placement.x.toFixed(1)}, ${placement.y.toFixed(
          1
        )})${rotatedText}`,
        30,
        yPosition
      );
      yPosition += 5;
    });

    yPosition += 5;
  });

  // Add visualization if provided
  if (visualizationElement) {
    try {
      const canvas = await html2canvas(visualizationElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text("Cutting Diagram", 20, 20);

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight);
    } catch (error) {
      console.error("Failed to add visualization to PDF:", error);
    }
  }

  // Save the PDF
  pdf.save(`${project.name.replace(/\s+/g, "_")}_optimization.pdf`);
};

export const importProjectFromJSON = (file: File): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const project = JSON.parse(e.target?.result as string);
        // Validate project structure
        if (!project.name || !project.planks || !project.cuts) {
          throw new Error("Invalid project file format");
        }
        resolve(project);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
