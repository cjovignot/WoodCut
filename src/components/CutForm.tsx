import React, { useState } from "react";
import type { RequiredCut } from "../types";
import { Plus, X } from "lucide-react";

interface CutFormProps {
  cuts: RequiredCut[];
  onCutsChange: (cuts: RequiredCut[]) => void;
  unit: string;
}

const CutForm: React.FC<CutFormProps> = ({ cuts, onCutsChange, unit }) => {
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

    onCutsChange([...cuts, newCut]);
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
    onCutsChange(cuts.filter((cut) => cut.id !== id));
  };

  const totalCuts = cuts.reduce((sum, cut) => sum + cut.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Cut
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

      {cuts.length > 0 && (
        <div className="space-y-2">
          {cuts.map((cut) => (
            <div
              key={cut.id}
              className="card p-4 flex justify-between items-center"
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
                className="text-red-500 hover:text-red-700 p-1"
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
