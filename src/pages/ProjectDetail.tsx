import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { useSettings } from "../hooks/useSettings";
import type { Project } from "../types";
import PlankForm from "../components/PlankForm";
import CutForm from "../components/CutForm";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, updateProject } = useProjects();
  const { settings } = useSettings();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        const projectData = await getProject(id);
        if (projectData) {
          setProject(projectData);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to load project:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, getProject, navigate]);

  const handleSave = async () => {
    if (!project) return;

    setSaving(true);
    try {
      await updateProject(project.id, {
        name: project.name,
        description: project.description,
        planks: project.planks,
        cuts: project.cuts,
      });
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleProjectChange = (updates: Partial<Project>) => {
    if (!project) return;
    setProject({ ...project, ...updates });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wood-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Project not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Project Details Form */}
      <div className="card p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Project Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => handleProjectChange({ name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={project.description || ""}
              onChange={(e) =>
                handleProjectChange({ description: e.target.value })
              }
              className="input-field"
              placeholder="Optional description"
            />
          </div>
        </div>
      </div>

      {/* Planks Section */}
      <PlankForm
        planks={project.planks}
        onPlanksChange={(planks) => handleProjectChange({ planks })}
        unit={settings.unit}
      />

      {/* Cuts Section */}
      <CutForm
        cuts={project.cuts}
        onCutsChange={(cuts) => handleProjectChange({ cuts })}
        unit={settings.unit}
      />

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/optimizer", { state: { project } })}
            className="btn-primary"
            disabled={project.planks.length === 0 || project.cuts.length === 0}
          >
            Run Optimization
          </button>
          <button
            onClick={() => navigate("/export", { state: { project } })}
            className="btn-secondary"
          >
            Export Project
          </button>
        </div>
        {(project.planks.length === 0 || project.cuts.length === 0) && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Add at least one plank and one cut to run optimization
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
