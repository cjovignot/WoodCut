import React, { useState, useMemo } from "react";
import type { RequiredCut, Project, Unit } from "../types";
import { Plus, X } from "lucide-react";

interface CutFormProps {
  project: Project;
  onProjectChange: (project: Project) => void;
  unit: Unit;
}

type SortKey = keyof Omit<RequiredCut, "id">;
type SortOrder = "asc" | "desc";

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

  // État pour le tri
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    order: SortOrder;
  } | null>(null);

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

  // Fonction pour gérer le tri
  const requestSort = (key: SortKey) => {
    let order: SortOrder = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.order === "asc") {
      order = "desc";
    }
    setSortConfig({ key, order });
  };

  // Cuts triés selon sortConfig
  const sortedCuts = useMemo(() => {
    if (!sortConfig) return project.cuts;
    return [...project.cuts].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.order === "asc" ? aValue - bValue : bValue - aValue;
      }
      return sortConfig.order === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [project.cuts, sortConfig]);

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return "";
    return sortConfig.order === "asc" ? "▲" : "▼";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Required Cuts{" "}
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

      {/* Table triable */}
      {project.cuts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="text-sm bg-gray-100">
              <tr>
                {["label", "length", "width", "thickness", "quantity"].map(
                  (key) => (
                    <th
                      key={key}
                      className="px-4 py-2 font-medium text-left cursor-pointer select-none"
                      onClick={() => requestSort(key as SortKey)}
                    >
                      {key === "label"
                        ? "Part"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      {key !== "label" && ` (${unit})`}
                      <span className="ml-1">
                        {getSortIndicator(key as SortKey)}
                      </span>
                    </th>
                  )
                )}
                <th className="px-4 py-2 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {sortedCuts.map((cut) => (
                <tr key={cut.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{cut.label}</td>
                  <td className="px-4 py-2">{cut.length}</td>
                  <td className="px-4 py-2">{cut.width}</td>
                  <td className="px-4 py-2">{cut.thickness}</td>
                  <td className="px-4 py-2">{cut.quantity}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => removeCut(cut.id)}
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
    </div>
  );
};

export default CutForm;
