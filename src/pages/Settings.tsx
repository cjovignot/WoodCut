import React from "react";
import { Moon, Sun, Ruler, Info } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import type { Unit } from "../types";

const Settings: React.FC = () => {
  const { settings, loading, updateSettings } = useSettings();

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-wood-600"></div>
      </div>
    );
  }

  const handleUnitChange = (unit: Unit) => {
    updateSettings({ unit });
  };

  const handleDarkModeToggle = () => {
    updateSettings({ darkMode: !settings.darkMode });
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
      <div className="mb-10">
        {" "}
        <h1 className="!text-3xl font-bold text-sky-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 !italic sm:text-lg text-sm">
          Customize your WoodCut Optimizer experience
        </p>
      </div>

      {/* Units */}
      <div className="p-0 mb-10 card">
        <div className="flex items-center mb-2">
          <Ruler className="w-5 h-5 mr-2 text-wood-600 dark:text-wood-400" />
          <h3 className="text-lg italic font-medium text-wood-600 dark:text-gray-100">
            Measurement Units
          </h3>
        </div>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Choose your preferred unit of measurement for all dimensions
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["mm", "cm", "inches"] as Unit[]).map((unit) => (
            <button
              key={unit}
              onClick={() => handleUnitChange(unit)}
              className={`!p-2 !text-xs rounded-lg border-2 transition-colors ${
                settings.unit === unit
                  ? "border-wood-500  !bg-sky-200/40 dark:!bg-slate-500/20 text-wood-700 dark:text-wood-300"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-medium">
                  {unit === "mm"
                    ? "Millimeters"
                    : unit === "cm"
                    ? "Centimeters"
                    : "Inches"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {unit}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="p-0 card">
        <div className="flex items-center mb-2">
          {settings.darkMode ? (
            <Moon className="w-5 h-5 mr-2 text-wood-600 dark:text-wood-400" />
          ) : (
            <Sun className="w-5 h-5 mr-2 text-wood-600 dark:text-wood-400" />
          )}
          <h3 className="text-lg italic font-medium text-gray-900 dark:text-gray-100">
            Appearance
          </h3>
        </div>
        <p className="mb-4 text-sm italic text-gray-600 dark:text-gray-400">
          Choose between light and dark mode
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Dark Mode
            </span>
          </div>
          <button
            onClick={handleDarkModeToggle}
            className={`relative inline-flex h-6 w-11 items-center !rounded-full dark:!border-white transition-colors ${
              settings.darkMode ? "!bg-sky-200/40" : "!bg-red-900/20"
            }`}
          >
            <span
              className={`inline-block min-h-4 min-w-4 transform rounded-full bg-slate-900/80 dark:!bg-white transition-transform ${
                settings.darkMode
                  ? "!bg-white translate-x-1"
                  : "!bg-white -translate-x-4"
              }`}
            />
          </button>
        </div>
      </div>

      {/* About */}
      <div className="p-6 card bg-sky-200/40 rounded-xl">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 mr-2 text-wood-600 dark:text-wood-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            About WoodCut Optimizer
          </h3>
        </div>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            WoodCut Optimizer is a powerful tool designed for carpenters and
            woodworkers to optimize cutting plans, reduce waste, and improve
            project efficiency.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                Features
              </h4>
              <ul className="space-y-1 text-xs">
                <li>• Advanced cutting optimization algorithm</li>
                <li>• Visual cutting diagrams</li>
                <li>• Project management</li>
                <li>• PDF and CSV export</li>
                <li>• Offline functionality</li>
                <li>• Dark mode support</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                Technology
              </h4>
              <ul className="space-y-1 text-xs">
                <li>• Progressive Web App (PWA)</li>
                <li>• Works on all devices</li>
                <li>• Local data storage</li>
                <li>• No internet required</li>
                <li>• Modern web technologies</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-6 border-red-200 card dark:border-red-800 bg-red-300/20 rounded-xl">
        <h3 className="mb-4 text-lg font-medium text-red-900 dark:text-red-100">
          Data Management
        </h3>
        <p className="mb-4 text-sm text-red-700 dark:text-red-300">
          All your project data is stored locally on your device. Make sure to
          export important projects as backups before clearing browser data.
        </p>
        <div className="text-xs text-red-600 dark:text-red-400">
          <p>• Data is not synced across devices</p>
          <p>• Clearing browser data will delete all projects</p>
          <p>• Use export/import to transfer projects</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
