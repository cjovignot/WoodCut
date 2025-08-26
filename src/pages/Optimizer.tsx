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
  const { settings } = useSettings();
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
      // Add a small delay to show loading state
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

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Cut Optimizer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Optimize your cutting plans to minimize waste and maximize efficiency
        </p>
      </div>

      {/* Project Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Select Project
        </h3>
        {projects.length > 0 ? (
          <div className="space-y-4">
            <select
              value={selectedProject?.id || ""}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
                setResult(null); // Clear previous results
              }}
              className="input-field"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.planks.length} planks,{" "}
                  {project.cuts.reduce((sum, cut) => sum + cut.quantity, 0)}{" "}
                  cuts)
                </option>
              ))}
            </select>

            {selectedProject && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {selectedProject.name}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-gray-500" />
                    <span>
                      {selectedProject.planks.length} planks available
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Scissors className="w-4 h-4 mr-2 text-gray-500" />
                    <span>
                      {selectedProject.cuts.reduce(
                        (sum, cut) => sum + cut.quantity,
                        0
                      )}{" "}
                      cuts required
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No projects found
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create a project first to run optimization
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Optimization Controls */}
      {selectedProject && (
        <div className="card p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Run Optimization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Calculate the most efficient cutting plan
              </p>
            </div>
            <button
              onClick={runOptimization}
              disabled={!canOptimize || isOptimizing}
              className="btn-primary flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              {isOptimizing ? "Optimizing..." : "Optimize"}
            </button>
          </div>

          {!canOptimize && selectedProject && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Project needs at least one plank and one cut to optimize
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optimization Results */}
      {result && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-wood-600 dark:text-wood-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Efficiency
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {result.totalEfficiency.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Planks Used
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {result.planksUsed}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <Scissors className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cuts Placed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {result.optimizedPlanks.reduce(
                      (sum, p) => sum + p.placements.length,
                      0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Waste
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {result.totalWaste.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">sq {settings.unit}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Unplaced Cuts Warning */}
          {result.unplacedCuts.length > 0 && (
            <div className="card p-4 border-l-4 border-red-500">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-800 dark:text-red-200">
                  Unplaced Cuts ({result.unplacedCuts.length})
                </h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                The following cuts could not be placed on available planks:
              </p>
              <div className="space-y-1">
                {result.unplacedCuts.map((cut) => (
                  <div
                    key={cut.id}
                    className="text-sm text-red-600 dark:text-red-400"
                  >
                    • {cut.label || "Unnamed cut"}: {cut.length} × {cut.width} ×{" "}
                    {cut.thickness} {settings.unit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visualization */}
          <OptimizationVisualization result={result} unit={settings.unit} />

          {/* Detailed Results */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Detailed Cutting Plan
            </h3>
            <div className="space-y-6">
              {result.optimizedPlanks.map((optimizedPlank, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Plank {index + 1} - {optimizedPlank.plank.material}
                    </h4>
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

                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Dimensions: {optimizedPlank.plank.length} ×{" "}
                    {optimizedPlank.plank.width} ×{" "}
                    {optimizedPlank.plank.thickness} {settings.unit}
                  </div>

                  {optimizedPlank.placements.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        Cuts ({optimizedPlank.placements.length}):
                      </h5>
                      {optimizedPlank.placements.map((placement, cutIndex) => (
                        <div
                          key={cutIndex}
                          className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded"
                        >
                          <span>
                            {placement.cut.label || `Cut ${cutIndex + 1}`}:{" "}
                            {placement.cut.length} × {placement.cut.width} ×{" "}
                            {placement.cut.thickness} {settings.unit}
                            {placement.rotated && (
                              <span className="text-blue-600 dark:text-blue-400 ml-2">
                                (rotated)
                              </span>
                            )}
                          </span>
                          <span className="text-gray-500">
                            Position: ({placement.x.toFixed(1)},{" "}
                            {placement.y.toFixed(1)})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No cuts placed on this plank
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Export Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Export Results
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() =>
                  navigate("/export", {
                    state: {
                      project: selectedProject,
                      result: result,
                    },
                  })
                }
                className="btn-primary"
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
                className="btn-secondary"
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
