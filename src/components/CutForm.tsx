import React, { useState } from "react";
import type { RequiredCut, Project, Unit } from "../types";
import { Plus, X } from "lucide-react";

interface CutFormProps {
  project: Project;
  onProjectChange: (project: Project) => void;
  unit: Unit;
}

const CutForm: React.FC<CutFormProps> = ({
  project,
  onProjectChange,
  unit,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    length: "",
    width: "",
    thickness: "",
    quantity: "1",
    label: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCut: RequiredCut = {
      id: crypto.randomUUID(),
      length: parseFloat(formData.length),
      width: parseFloat(formData.width),
      thickness: parseFloat(formData.thickness),
      quantity: parseInt(formData.quantity),
      label: formData.label || undefined,
    };

    const updatedProject: Project = {
      ...project,
      cuts: [...project.cuts, newCut],
      updatedAt: new Date(),
    };

    onProjectChange(updatedProject);

    setFormData({
      length: "",
      width: "",
      thickness: "",
      quantity: "1",
      label: "",
    });
    setShowForm(false);
  };

  const removeCut = (id: string) => {
    const updatedProject: Project = {
      ...project,
      cuts: project.cuts.filter((cut) => cut.id !== id),
      updatedAt: new Date(),
    };

    onProjectChange(updatedProject);
  };

  const totalCuts = project.cuts.reduce((sum, cut) => sum + cut.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Required Cuts
          {totalCuts > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({totalCuts} total)
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Cut
        </button>
      </div>

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
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Label (optional)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                className="input-field"
                placeholder="e.g., Shelf, Side panel"
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
              Add Cut
            </button>
          </div>
        </form>
      )}

      {project.cuts.length > 0 && (
        <div className="space-y-2">
          {project.cuts.map((cut) => (
            <div
              key={cut.id}
              className="flex items-center justify-between p-4 card"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-4 text-sm">
                  {cut.label && (
                    <span className="font-medium">{cut.label}</span>
                  )}
                  <span>
                    {cut.length} × {cut.width} × {cut.thickness} {unit}
                  </span>
                  <span className="text-gray-500">Qty: {cut.quantity}</span>
                </div>
              </div>
              <button
                onClick={() => removeCut(cut.id)}
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

export default CutForm;
