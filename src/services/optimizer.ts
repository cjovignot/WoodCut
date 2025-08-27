import type {
  WoodPlank,
  RequiredCut,
  OptimizationResult,
  OptimizedPlank,
  CutPlacement,
} from "../types";

/**
 * Advanced wood cutting optimization algorithm
 * Uses a combination of First Fit Decreasing and Bottom-Left Fill algorithms
 */
export class WoodCutOptimizer {
  private tolerance = 0.1; // Small tolerance for floating point comparisons

  /**
   * Main optimization function
   */
  optimize(planks: WoodPlank[], cuts: RequiredCut[]): OptimizationResult {
    // Expand cuts based on quantity
    const expandedCuts = this.expandCuts(cuts);

    // Sort cuts by area (largest first) for better optimization
    const sortedCuts = expandedCuts.sort(
      (a, b) => b.length * b.width - a.length * a.width
    );

    const optimizedPlanks: OptimizedPlank[] = [];
    const unplacedCuts: RequiredCut[] = [];
    let currentPlankIndex = 0;

    // Process each cut
    for (const cut of sortedCuts) {
      let placed = false;

      // Try to place on existing planks first
      for (const optimizedPlank of optimizedPlanks) {
        if (this.canPlaceCut(optimizedPlank, cut)) {
          const placement = this.findBestPosition(optimizedPlank, cut);
          if (placement) {
            optimizedPlank.placements.push(placement);
            this.updatePlankStats(optimizedPlank);
            placed = true;
            break;
          }
        }
      }

      // If not placed, try a new plank
      if (!placed && currentPlankIndex < planks.length) {
        const newOptimizedPlank = this.createOptimizedPlank(
          planks[currentPlankIndex]
        );
        const placement = this.findBestPosition(newOptimizedPlank, cut);

        if (placement) {
          newOptimizedPlank.placements.push(placement);
          this.updatePlankStats(newOptimizedPlank);
          optimizedPlanks.push(newOptimizedPlank);
          placed = true;
          currentPlankIndex++;
        }
      }

      if (!placed) {
        unplacedCuts.push(cut);
      }
    }

    return this.calculateResults(optimizedPlanks, unplacedCuts);
  }

  private expandCuts(cuts: RequiredCut[]): RequiredCut[] {
    const expanded: RequiredCut[] = [];

    cuts.forEach((cut) => {
      for (let i = 0; i < cut.quantity; i++) {
        expanded.push({
          ...cut,
          id: `${cut.id}_${i}`,
          quantity: 1,
        });
      }
    });

    return expanded;
  }

  private createOptimizedPlank(plank: WoodPlank): OptimizedPlank {
    return {
      plank,
      placements: [],
      wasteArea: plank.length * plank.width,
      efficiency: 0,
    };
  }

  private canPlaceCut(
    optimizedPlank: OptimizedPlank,
    cut: RequiredCut
  ): boolean {
    const { plank } = optimizedPlank;

    // Check thickness compatibility
    if (Math.abs(plank.thickness - cut.thickness) > this.tolerance) {
      return false;
    }

    // Check if cut fits in plank dimensions (with or without rotation)
    const fitsNormal =
      cut.length <= plank.length + this.tolerance &&
      cut.width <= plank.width + this.tolerance;
    const fitsRotated =
      cut.width <= plank.length + this.tolerance &&
      cut.length <= plank.width + this.tolerance;

    return fitsNormal || fitsRotated;
  }

  private findBestPosition(
    optimizedPlank: OptimizedPlank,
    cut: RequiredCut
  ): CutPlacement | null {
    const { plank } = optimizedPlank;

    // Try both orientations
    const orientations = [
      { length: cut.length, width: cut.width, rotated: false },
      { length: cut.width, width: cut.length, rotated: true },
    ];

    for (const orientation of orientations) {
      if (
        orientation.length > plank.length + this.tolerance ||
        orientation.width > plank.width + this.tolerance
      ) {
        continue;
      }

      // Use Bottom-Left Fill algorithm
      const position = this.findBottomLeftPosition(
        optimizedPlank,
        orientation.length,
        orientation.width
      );

      if (position) {
        return {
          cut,
          x: position.x,
          y: position.y,
          rotated: orientation.rotated,
        };
      }
    }

    return null;
  }

  private findBottomLeftPosition(
    optimizedPlank: OptimizedPlank,
    length: number,
    width: number
  ): { x: number; y: number } | null {
    const {
      // plank,
      placements,
    } = optimizedPlank;

    // Generate candidate positions
    const candidates: { x: number; y: number }[] = [{ x: 0, y: 0 }];

    // Add positions based on existing placements
    placements.forEach((placement) => {
      const cutLength = placement.rotated
        ? placement.cut.width
        : placement.cut.length;
      const cutWidth = placement.rotated
        ? placement.cut.length
        : placement.cut.width;

      candidates.push(
        { x: placement.x + cutLength, y: placement.y },
        { x: placement.x, y: placement.y + cutWidth }
      );
    });

    // Sort candidates by y first (bottom), then by x (left)
    candidates.sort((a, b) => a.y - b.y || a.x - b.x);

    // Find first valid position
    for (const candidate of candidates) {
      if (
        this.isValidPosition(
          optimizedPlank,
          candidate.x,
          candidate.y,
          length,
          width
        )
      ) {
        return candidate;
      }
    }

    return null;
  }

  private isValidPosition(
    optimizedPlank: OptimizedPlank,
    x: number,
    y: number,
    length: number,
    width: number
  ): boolean {
    const { plank, placements } = optimizedPlank;

    // Check bounds
    if (
      x + length > plank.length + this.tolerance ||
      y + width > plank.width + this.tolerance
    ) {
      return false;
    }

    // Check overlap with existing placements
    for (const placement of placements) {
      const cutLength = placement.rotated
        ? placement.cut.width
        : placement.cut.length;
      const cutWidth = placement.rotated
        ? placement.cut.length
        : placement.cut.width;

      if (
        this.rectanglesOverlap(
          x,
          y,
          length,
          width,
          placement.x,
          placement.y,
          cutLength,
          cutWidth
        )
      ) {
        return false;
      }
    }

    return true;
  }

  private rectanglesOverlap(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return !(
      x1 + w1 <= x2 + this.tolerance ||
      x2 + w2 <= x1 + this.tolerance ||
      y1 + h1 <= y2 + this.tolerance ||
      y2 + h2 <= y1 + this.tolerance
    );
  }

  private updatePlankStats(optimizedPlank: OptimizedPlank): void {
    const { plank, placements } = optimizedPlank;
    const totalPlankArea = plank.length * plank.width;

    let usedArea = 0;
    placements.forEach((placement) => {
      const cutLength = placement.rotated
        ? placement.cut.width
        : placement.cut.length;
      const cutWidth = placement.rotated
        ? placement.cut.length
        : placement.cut.width;
      usedArea += cutLength * cutWidth;
    });

    optimizedPlank.wasteArea = totalPlankArea - usedArea;
    optimizedPlank.efficiency = (usedArea / totalPlankArea) * 100;
  }

  private calculateResults(
    optimizedPlanks: OptimizedPlank[],
    unplacedCuts: RequiredCut[]
  ): OptimizationResult {
    let totalWaste = 0;
    let totalArea = 0;

    optimizedPlanks.forEach((optimizedPlank) => {
      const plankArea =
        optimizedPlank.plank.length * optimizedPlank.plank.width;
      totalWaste += optimizedPlank.wasteArea;
      totalArea += plankArea;
    });

    const totalEfficiency =
      totalArea > 0 ? ((totalArea - totalWaste) / totalArea) * 100 : 0;

    return {
      optimizedPlanks,
      totalWaste,
      totalEfficiency,
      planksUsed: optimizedPlanks.length,
      unplacedCuts,
    };
  }
}

export const optimizer = new WoodCutOptimizer();
