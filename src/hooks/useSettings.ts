import { useState, useEffect } from "react";
import type { Settings } from "../types";
import { db } from "../services/database";

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    unit: "mm",
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const savedSettings = await db.settings.get(1);
      if (savedSettings) {
        setSettings({
          unit: savedSettings.unit,
          darkMode: savedSettings.darkMode,
        });

        // Apply dark mode
        if (savedSettings.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };

    await db.settings.update(1, updatedSettings);
    setSettings(updatedSettings);

    // Apply dark mode
    if (updatedSettings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
  };
};
