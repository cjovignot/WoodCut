import Dexie from "dexie";
import type { Table } from "dexie";
import type { Project, Settings } from "../types";

export class WoodCutDatabase extends Dexie {
  projects!: Table<Project>;
  settings!: Table<Settings & { id: number }>;

  constructor() {
    super("WoodCutOptimizer");

    this.version(1).stores({
      projects: "id, name, createdAt, updatedAt",
      settings: "id",
    });
  }
}

export const db = new WoodCutDatabase();

// Initialize default settings
db.on("ready", async () => {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 1,
      unit: "mm",
      darkMode: false,
    });
  }
});
