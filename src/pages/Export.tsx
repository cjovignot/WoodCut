import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, FileText, Upload, ArrowLeft } from "lucide-react";
import type { Project, OptimizationResult } from "../types";
import { useProjects } from "../hooks/useProjects";
import {
  exportProjectAsJSON,
  exportProjectAsCSV,
  exportOptimizationAsPDF,
  importProjectFromJSON,
} from "../utils/export";

const Export: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, createProject } = useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    location.state?.project || null
  );
  const [result] = useState<OptimizationResult | null>(
    location.state?.result || null
  );
  const [importing, setImporting] = useState(false);

  const handleExportJSON = () => {
    if (!selectedProject) return;
    exportProjectAsJSON(selectedProject);
  };

  const handleExportCSV = () => {
    if (!selectedProject) return;
    exportProjectAsCSV(selectedProject);
  };

  const handleExportPDF = async () => {
    if (!selectedProject || !result) return;

    // Find the visualization element
    const visualizationElement = document.querySelector(
      ".optimization-visualization"
    ) as HTMLElement;
    await exportOptimizationAsPDF(
      selectedProject,
      result,
      visualizationElement
    );
  };

  const handleImportJSON = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const importedProject = await importProjectFromJSON(file);

      // Create new project with imported data
      const newProject = await createProject({
        name: `${importedProject.name} (Imported)`,
        description: importedProject.description,
        planks: importedProject.planks,
        cuts: importedProject.cuts,
        isFavorite: false,
      });

      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import project. Please check the file format.");
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  return (
    <div className="pb-20 space-y-6 md:pb-0">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 dark:!bg-sky-200/60 hover:text-gray-600 dark:text-slate-900 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="">
          {" "}
          <h1 className="!text-3xl font-bold text-wood-600 dark:text-gray-100">
            Export & Import
          </h1>
          <p className="text-wood-600 dark:text-gray-400">
            Export your projects and optimization results, or import existing
            projects
          </p>
        </div>
      </div>

      {/* Project Selection */}
      <div className="p-0 card">
        <div className="pb-4 mb-2">
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            Select Project to Export
          </h3>
          {projects.length > 0 ? (
            <select
              value={selectedProject?.id || ""}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
              className="w-full text-sm input-field"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                No projects to export
              </h4>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Create a project first to export data
              </p>
              <button onClick={() => navigate("/")} className="btn-primary">
                Create Project
              </button>
            </div>
          )}
        </div>

        {/* Export Options */}
        {selectedProject && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Project Data Export */}
            <div className="p-6 card bg-sky-100/70 rounded-xl">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Export Project Data
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Export your project data to share with others or backup your
                work
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center w-full btn-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as JSON
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center w-full btn-secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as CSV
                </button>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p>• JSON: Complete project data with all settings</p>
                <p>• CSV: Spreadsheet format for planks and cuts</p>
              </div>
            </div>

            {/* Optimization Results Export */}
            <div className="p-6 card bg-sky-100/70 rounded-xl">
              <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Export Optimization Results
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Export cutting plans and diagrams for workshop use
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleExportPDF}
                  disabled={!result}
                  className="flex items-center justify-center w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF Report
                </button>
              </div>
              {!result && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Run optimization first to export cutting diagrams
                </div>
              )}
              {result && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  PDF includes cutting instructions, diagrams, and statistics
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Import Section */}
      <div className="p-6 card bg-sky-100/70 rounded-xl">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Import Project
        </h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Import a project from a JSON file exported from WoodCut Optimizer
        </p>
        <div className="flex items-center space-x-4">
          <label className="flex items-center cursor-pointer btn-secondary">
            <Upload className="w-4 h-4 mr-2" />
            {importing ? "Importing..." : "Choose JSON File"}
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Only JSON files exported from WoodCut Optimizer are supported
        </div>
      </div>

      {/* Export Tips */}
      <div className="p-6 border-blue-200 card bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <h3 className="mb-4 text-lg font-medium text-blue-900 dark:text-blue-100">
          Export Tips
        </h3>
        <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <p>
            • <strong>JSON files</strong> preserve all project data and can be
            imported back
          </p>
          <p>
            • <strong>CSV files</strong> can be opened in Excel or Google Sheets
            for further analysis
          </p>
          <p>
            • <strong>PDF reports</strong> are perfect for printing and taking
            to the workshop
          </p>
          <p>
            • <strong>Backup regularly</strong> by exporting your important
            projects
          </p>
        </div>
      </div>
    </div>
  );
};

export default Export;
