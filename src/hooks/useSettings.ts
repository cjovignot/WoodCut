import { useState, useEffect } from "react";
import type { Settings } from "../types";
import { db } from "../services/database";

export const useSettings = () => {
  const [settings, setSettings] = useState<(Settings & { id: number }) | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const savedSettings = await db.settings.get(1);
      if (savedSettings) {
        setSettings(savedSettings);
      } else {
        const defaultSettings: Settings & { id: number } = {
          id: 1,
          unit: "mm",
          darkMode: false,
        };
        await db.settings.add(defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;
    const updated = { ...settings, ...newSettings };
    await db.settings.update(1, updated);
    setSettings(updated);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return { settings, loading, updateSettings };
};
