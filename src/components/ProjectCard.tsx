import React from "react";
import type { Project } from "../types";
import { Calendar, Edit, Trash2, Package, Scissors } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-400 hover:text-wood-600 dark:hover:text-wood-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-1" />
            <span>{project.planks.length} planks</span>
          </div>
          <div className="flex items-center">
            <Scissors className="w-4 h-4 mr-1" />
            <span>
              {project.cuts.reduce((sum, cut) => sum + cut.quantity, 0)} cuts
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(project.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
