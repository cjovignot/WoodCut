import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Play,
  BarChart3,
  Package,
  Scissors,
  AlertTriangle,
} from "lucide-react";
import type { Project, OptimizationResult } from "../types";
import { optimizer } from "../services/optimizer";
import { useSettings } from "../hooks/useSettings";
import { useProjects } from "../hooks/useProjects";
import OptimizationVisualization from "../components/OptimizationVisualization";

const Optimizer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings = { unit: "mm", darkMode: false } } = useSettings();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    location.state?.project || null
  );
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (location.state?.project) {
      setSelectedProject(location.state.project);
    }
  }, [location.state]);

  const runOptimization = async () => {
    if (!selectedProject) return;

    setIsOptimizing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const optimizationResult = optimizer.optimize(
        selectedProject.planks,
        selectedProject.cuts
      );
      setResult(optimizationResult);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const canOptimize =
    selectedProject &&
    selectedProject.planks.length > 0 &&
    selectedProject.cuts.length > 0;

  // Fonction pour formater le waste en unités lisibles
  function formatWaste(optimizedPlanks: OptimizationResult["optimizedPlanks"]) {
    if (!optimizedPlanks) return "-";

    let totalLinear = 0; // mm
    let totalArea = 0; // mm²
    let isLinear = true;

    // On parcourt seulement les planches utilisées (optimizedPlanks)
    optimizedPlanks.forEach((plank) => {
      const plankLength = plank.plank.length;

      // Calcul du reste de chaque planche
      let usedLength = 0;
      plank.placements.forEach((p) => {
        const cut = p.cut;
        const cutLength = p.rotated ? cut.width : cut.length;
        const cutWidth = p.rotated ? cut.length : cut.width;

        // Si le cut occupe toute la largeur et n'est pas pivoté, on peut compter en linéaire
        if (cut.width === plank.plank.width && !p.rotated) {
          usedLength += cut.length;
        } else {
          totalArea += cutLength * cutWidth;
          isLinear = false;
        }
      });

      if (isLinear) {
        totalLinear += plankLength - usedLength;
      }
    });

    if (isLinear) {
      if (totalLinear >= 1000) return `${(totalLinear / 1000).toFixed(2)} m`;
      return `${totalLinear.toFixed(0)} mm`;
    } else {
      if (totalArea >= 1_000_000)
        return `${(totalArea / 1_000_000).toFixed(2)} m²`;
      if (totalArea >= 10_000) return `${(totalArea / 100).toFixed(2)} cm²`;
      return `${totalArea.toFixed(0)} mm²`;
    }
  }

  return (
    <div className="pb-20 space-y-6 md:pb-0">
      {/* Header */}
      <div>
        {" "}
        <h1 className="!text-3xl font-bold text-wood-600 dark:text-gray-100">
          Cut Optimizer
        </h1>
        <p className="text-gray-600 text-wood-600 dark:text-gray-400 !italic sm:text-lg text-sm">
          Optimize your cutting plans to minimize waste and maximize efficiency
        </p>
      </div>

      {/* Project Selection */}
      <div className="max-w-sm p-2 mb-2 rounded-lg bg-sky-100/70 card">
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-slate-900/80">
          Select Project
        </h3>
        {projects.length > 0 ? (
          <div className="space-y-2 text-sm">
            <select
              value={selectedProject?.id || ""}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
                setResult(null);
              }}
              className="input-field text-slate-900/80"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} (
                  {project.planks.reduce(
                    (sum, plank) => sum + plank.quantity,
                    0
                  )}{" "}
                  planks,{" "}
                  {project.cuts.reduce((sum, cut) => sum + cut.quantity, 0)}{" "}
                  cuts)
                </option>
              ))}
            </select>

            {selectedProject && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {selectedProject.name}
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-500 dark:text-white" />
                    <span>
                      {selectedProject.planks.reduce(
                        (sum, plank) => sum + plank.quantity,
                        0
                      )}{" "}
                      planks available
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Scissors className="w-4 h-4 mr-2 text-gray-500 dark:text-white" />
                    <span>
                      {selectedProject.cuts.reduce(
                        (sum, cut) => sum + cut.quantity,
                        0
                      )}{" "}
                      cuts required
                    </span>
                  </div>
                </div>

                {/* Optimization Controls */}
                {selectedProject && (
                  <div className="">
                    {/* <div className="flex items-center justify-between"> */}
                    {/* <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Run Optimization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calculate the most efficient cutting plan
              </p>
            </div> */}
                    <button
                      onClick={runOptimization}
                      disabled={!canOptimize || isOptimizing}
                      className="flex items-center justify-center w-full text-white btn-primary !bg-green-900/70"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isOptimizing ? "Optimizing..." : "Optimize"}
                    </button>
                    {/* </div> */}

                    {!canOptimize && selectedProject && (
                      <div className="p-4 mt-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                        <div className="flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">
                            Project needs at least one plank and one cut to
                            optimize
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No projects found
            </h4>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Create a project first to run optimization
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Optimization Results */}
      {result && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="p-2 card">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-wood-600 dark:text-wood-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Efficiency
                  </p>
                  <p className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                    {result.totalEfficiency.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 card">
              <div className="flex items-center">
                <Package className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Planks Used
                  </p>
                  <p className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                    {result.planksUsed}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-2 card">
              <div className="flex items-center">
                <Scissors className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cuts Placed
                  </p>
                  <p className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                    {result.optimizedPlanks.reduce(
                      (sum, p) => sum + p.placements.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Waste */}
            <div className="p-2 card">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 mr-3 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Waste
                  </p>
                  <p className="text-xl font-bold text-gray-900 md:text-2xl dark:text-gray-100">
                    {formatWaste(result.optimizedPlanks)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Unplaced Cuts Warning */}
          {result.unplacedCuts.length > 0 && (
            <div className="p-4 border-l-4 border-red-500 card">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Unplaced Cuts ({result.unplacedCuts.length})
                </h4>
              </div>
              <p className="mb-2 text-sm text-red-700 dark:text-red-300">
                The following cuts could not be placed on available planks:
              </p>
              <div className="space-y-1">
                {(() => {
                  const groupedCuts = new Map<
                    string,
                    {
                      cut: OptimizationResult["unplacedCuts"][0];
                      count: number;
                    }
                  >();
                  result.unplacedCuts.forEach((cut) => {
                    const key = `${cut.length}x${cut.width}x${cut.thickness}|${
                      cut.label || "Unnamed cut"
                    }`;
                    if (groupedCuts.has(key)) {
                      groupedCuts.get(key)!.count += 1;
                    } else {
                      groupedCuts.set(key, { cut, count: 1 });
                    }
                  });

                  return Array.from(groupedCuts.values()).map(
                    ({ cut, count }) => (
                      <div
                        key={`${cut.id}-${cut.length}-${cut.width}-${cut.thickness}`}
                        className="text-sm text-red-600 dark:text-red-400"
                      >
                        • {cut.label || "Unnamed cut"}: {cut.length} ×{" "}
                        {cut.width} × {cut.thickness} {settings?.unit} (×{count}
                        )
                      </div>
                    )
                  );
                })()}
              </div>
              <div className="mt-2 text-sm text-red-800 dark:text-red-200">
                Estimated additional planks needed:{" "}
                {result.additionalPlanksNeeded}
              </div>
            </div>
          )}

          {/* Visualization */}
          <OptimizationVisualization
            result={result}
            unit={settings?.unit || "mm"}
          />
          {/* Detailed Results */}
          <div className="p-0 card">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Detailed Cutting Plan
            </h3>
            <div className="space-y-6">
              {result.optimizedPlanks.map((optimizedPlank, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-col">
                      <h4 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
                        Plank {index + 1}
                      </h4>
                      <p className="text-xs">{optimizedPlank.plank.material}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        optimizedPlank.efficiency > 70
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : optimizedPlank.efficiency > 50
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {optimizedPlank.efficiency.toFixed(1)}% efficient
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-bold">L: </span>
                      {optimizedPlank.plank.length} {settings?.unit}
                    </p>
                    <p>
                      <span className="font-bold">l: </span>
                      {optimizedPlank.plank.width} {settings?.unit}
                    </p>
                    <p>
                      <span className="font-bold">Th: </span>{" "}
                      {optimizedPlank.plank.thickness} {settings?.unit}
                    </p>
                  </div>

                  <div className="overflow-x-auto ">
                    {optimizedPlank.placements.length > 0 ? (
                      <table className="min-w-full text-sm text-left border border-gray-200 dark:border-gray-600">
                        <thead>
                          <tr className="text-xs bg-gray-100 dark:bg-gray-700">
                            <th className="px-2 py-1">Cut</th>
                            <th className="px-2 py-1">
                              Length {settings?.unit}
                            </th>
                            <th className="px-2 py-1">
                              Width {settings?.unit}
                            </th>
                            <th className="px-2 py-1">
                              Thickness {settings?.unit}
                            </th>
                            <th className="px-2 py-1">Rotated</th>
                            <th className="px-2 py-1">X</th>
                            <th className="px-2 py-1">Y</th>
                          </tr>
                        </thead>
                        <tbody>
                          {optimizedPlank.placements.map((placement, idx) => (
                            <tr
                              key={idx}
                              className="border-t border-gray-200 dark:border-gray-600"
                            >
                              <td className="px-2 py-1 font-bold">
                                {placement.cut.label || `Cut ${idx + 1}`}
                              </td>
                              <td className="px-2 py-1">
                                {placement.cut.length}
                              </td>
                              <td className="px-2 py-1">
                                {placement.cut.width}
                              </td>
                              <td className="px-2 py-1">
                                {placement.cut.thickness}
                              </td>
                              <td className="px-2 py-1">
                                {placement.rotated ? "Yes" : "No"}
                              </td>
                              <td className="px-2 py-1">
                                {placement.x.toFixed(1)}
                              </td>
                              <td className="px-2 py-1">
                                {placement.y.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No cuts placed on this plank
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="p-3 card">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Export Results
            </h3>
            <div className="grid flex-wrap gap-4">
              <button
                onClick={() =>
                  navigate("/export", {
                    state: {
                      project: selectedProject,
                      result: result,
                    },
                  })
                }
                className="btn-primary dark:!bg-red-500/20"
              >
                Export as PDF
              </button>
              <button
                onClick={() =>
                  navigate("/export", {
                    state: {
                      project: selectedProject,
                      result: result,
                    },
                  })
                }
                className="btn-secondary dark:!bg-green-500/20"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Optimizer;
