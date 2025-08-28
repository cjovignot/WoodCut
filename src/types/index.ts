export interface WoodPlank {
  id: string;
  length: number;
  width: number;
  thickness: number;
  material: string;
  quantity: number;
}

export interface RequiredCut {
  id: string;
  length: number;
  width: number;
  thickness: number;
  quantity: number;
  label?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  planks: WoodPlank[];
  cuts: RequiredCut[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CutPlacement {
  cut: RequiredCut;
  x: number;
  y: number;
  rotated: boolean;
}

export interface OptimizedPlank {
  plank: WoodPlank;
  placements: CutPlacement[];
  wasteArea: number;
  wasteDisplay?: string;
  wasteLength?: number;
  efficiency: number;
}

export interface OptimizationResult {
  optimizedPlanks: OptimizedPlank[];
  totalWaste: number;
  totalEfficiency: number;
  planksUsed: number;
  unplacedCuts: RequiredCut[];
}

export type Unit = "mm" | "cm" | "inches";

export interface Settings {
  id?: number; // facultatif pour IndexedDB
  unit: "mm" | "cm" | "inches";
  darkMode: boolean;
}
