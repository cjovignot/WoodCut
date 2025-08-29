import React, { useState } from "react";
import type { WoodPlank, Unit, Project } from "../types";
import { Plus, X } from "lucide-react";

interface PlankFormProps {
  project: Project;
  onProjectChange: (project: Project) => void;
  unit: Unit;
}

const PlankForm: React.FC<PlankFormProps> = ({
  project,
  onProjectChange,
  unit,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    length: "",
    label: "",
    width: "",
    thickness: "",
    material: "",
    quantity: "1",
  });
  const totalPlanks = project.planks.reduce(
    (sum, plank) => sum + plank.quantity,
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPlank: WoodPlank = {
      id: crypto.randomUUID(),
      label: formData?.label,
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      thickness: parseFloat(formData.thickness),
      material: formData.material,
      quantity: parseInt(formData.quantity, 10),
    };

    const updatedProject: Project = {
      ...project,
      planks: [...project.planks, newPlank],
      updatedAt: new Date(),
    };

    // Met à jour le parent et IndexedDB
    onProjectChange(updatedProject);

    // Reset form
    setFormData({
      length: "",
      label: "",
      width: "",
      thickness: "",
      material: "",
      quantity: "1",
    });
    setShowForm(false);
  };

  const removePlank = (id: string) => {
    const updatedProject: Project = {
      ...project,
      planks: project.planks.filter((plank) => plank.id !== id),
      updatedAt: new Date(),
    };

    onProjectChange(updatedProject);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-col items-start">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Wood Planks
          </h3>
          <span>
            {totalPlanks > 0 && (
              <span className="text-sm text-gray-500">
                (total: {totalPlanks})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Table of planks */}
      {project.planks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="text-sm bg-gray-100 dark:!bg-sky-900 dark:!text-white">
              <tr>
                <th className="px-4 py-2 font-medium text-left">Matériau</th>

                <th className="px-4 py-2 font-medium text-left">
                  Longueur ({unit})
                </th>
                <th className="px-4 py-2 font-medium text-left">
                  Largeur ({unit})
                </th>
                <th className="px-4 py-2 font-medium text-left">
                  Epaisseur ({unit})
                </th>
                <th className="px-4 py-2 font-medium text-left">Quantité</th>
                <th className="px-4 py-2 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {project.planks.map((plank) => (
                <tr
                  key={plank.id}
                  className="hover:bg-gray-50 dark:hover:!bg-sky-900/20"
                >
                  <td className="px-4 py-2">{plank.material}</td>

                  <td className="px-4 py-2">{plank.length}</td>
                  <td className="px-4 py-2">{plank.width}</td>
                  <td className="px-4 py-2">{plank.thickness}</td>
                  <td className="px-4 py-2">{plank.quantity}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => removePlank(plank.id)}
                      type="button"
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4 rounded-lg bg-sky-300/10 card"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Length ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.length}
                onChange={(e) =>
                  setFormData({ ...formData, length: e.target.value })
                }
                className="px-2 rounded-sm input-field bg-sky-100/10"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Width ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: e.target.value })
                }
                className="px-2 rounded-sm input-field bg-sky-100/10"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Thickness ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.thickness}
                onChange={(e) =>
                  setFormData({ ...formData, thickness: e.target.value })
                }
                className="px-2 rounded-sm input-field bg-sky-100/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Material
              </label>
              <input
                type="text"
                required
                value={formData.material}
                onChange={(e) =>
                  setFormData({ ...formData, material: e.target.value })
                }
                className="px-2 rounded-sm input-field bg-sky-100/10"
                placeholder="e.g., Pine, Oak, Plywood"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-2 rounded-sm input-field bg-sky-100/10"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Plank
            </button>
          </div>
        </form>
      )}

      {showForm ? (
        <></>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(!showForm)}
            type="button"
            className="flex items-center btn-primary dark:!bg-sky-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plank
          </button>
        </div>
      )}
    </div>
  );
};

export default PlankForm;
