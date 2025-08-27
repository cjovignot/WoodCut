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
    width: "",
    thickness: "",
    material: "",
    quantity: "1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPlank: WoodPlank = {
      id: crypto.randomUUID(),
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Wood Planks
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          type="button"
          className="flex items-center btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plank
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 space-y-4 card">
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
                className="input-field"
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
                className="input-field"
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
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className="input-field"
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
                className="input-field"
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

      {/* List of planks */}
      {project.planks.length > 0 && (
        <div className="space-y-2">
          {project.planks.map((plank) => (
            <div
              key={plank.id}
              className="flex items-center justify-between p-4 card"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="font-medium">{plank.material}</span>
                  <span>
                    {plank.length} × {plank.width} × {plank.thickness} {unit}
                  </span>
                  <span className="text-gray-500">Qty: {plank.quantity}</span>
                </div>
              </div>
              <button
                onClick={() => removePlank(plank.id)}
                type="button"
                className="p-1 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlankForm;
