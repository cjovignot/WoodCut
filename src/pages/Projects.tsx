import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import ProjectCard from "../components/ProjectCard";

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, updateProject, loading, createProject, deleteProject } =
    useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newProject = await createProject({
      name: formData.name,
      description: formData.description,
      planks: [],
      cuts: [],
      isFavorite: false,
    });

    setFormData({ name: "", description: "" });
    setShowCreateForm(false);
    navigate(`/project/${newProject.id}`);
  };

  const handleEditProject = (project: any) => {
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
    }
  };
  const toggleFavorite = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const updated = {
      ...project,
      isFavorite: !project.isFavorite,
      updatedAt: new Date(),
    };

    await updateProject(project.id, updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-wood-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-6 md:pb-0">
      {/* Header */}
      <div className="flex justify-between m-0 mb-2">
        <h1 className="!text-3xl font-bold text-sky-900 dark:text-gray-100">
          Projects
        </h1>

        <button
          onClick={() => setShowCreateForm(true)}
          className="!text-xs text-sky-900 flex items-center btn-primary !bg-sky-100 !p-0 !px-3"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 !italic sm:text-lg text-sm">
        Manage your woodworking projects and cutting plans
      </p>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 input-field w-[-webkit-fill-available] rounded-xl"
        />
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateProject} className="p-6 space-y-4 card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Create New Project
          </h3>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field"
              rows={3}
              placeholder="Enter project description"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onToggleFavorite={toggleFavorite} // 👈 ICI obligatoire
            />
          ))}
        </div>
      ) : (
        <div className="flex-col p-12 text-center bg-sky-100 rounded-2xl card">
          <div className="mb-4 text-sky-200">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-sky-900 dark:text-gray-100">
            {searchTerm ? "No projects found" : "No projects yet"}
          </h3>
          <p className="mb-6 text-sm text-sky-900 dark:text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first project to get started with wood cutting optimization"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary text-sky-900"
            >
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
