import React from "react";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import { Calendar, Edit, Trash2, Package, Scissors, Heart } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void; // 🔥 obligatoire maintenant
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleNavigate = () => {
    navigate("/optimizer", { state: { project } });
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // ⛔ évite la navigation
    onToggleFavorite(project.id);
  };

  return (
    <div
      className="relative p-6 transition cursor-pointer hover:bg-sky-100 bg-sky-100/50 duration-400 card hover:shadow-md rounded-xl"
      onClick={handleNavigate}
    >
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900/80">
          {project.name}
        </h3>
        {/* ❤️ Bouton Favori */}
        <div
          onClick={toggleFavorite}
          className="p-1 rounded-full top-3 right-3 hover:bg-sky-200"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              project.isFavorite
                ? "fill-red-500/40 text-red-900/50 hover:text-red-900 hover:fill-red-900 duration-400"
                : "text-gray-400"
            }`}
          />
        </div>
      </div>
      {project.description ? (
        <p className="text-sm text-gray-600 dark:text-slate-900/80">
          {project.description}
        </p>
      ) : (
        <p className="text-sm italic text-gray-600 dark:text-slate-900/80">
          No description
        </p>
      )}

      <div className="flex items-start justify-between mt-2 text-sm text-gray-600 dark:text-slate-900/80">
        <div className="flex-col items-center space-x-4">
          <div className="flex items-center">
            <Package className="w-4 h-4 mr-1" />
            <span>
              {project.planks.reduce((sum, plank) => sum + plank.quantity, 0)}{" "}
              planks
            </span>
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

      <div className="flex justify-end mt-4 space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project);
          }}
          className="p-2 text-gray-400 transition-colors hover:text-wood-600 dark:hover:text-wood-400"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          className="p-2 text-gray-400 transition-colors hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
