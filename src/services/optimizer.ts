// import type {
//   WoodPlank,
//   RequiredCut,
//   OptimizationResult,
//   OptimizedPlank,
//   CutPlacement,
// } from "../types";

// export class WoodCutOptimizer {
//   private tolerance = 0.1;
//   private sawThickness = 4; // épaisseur de la lame en mm

//   optimize(planks: WoodPlank[], cuts: RequiredCut[]): OptimizationResult {
//     // Étendre les planches en fonction de leur quantité
//     const expandedPlanks: WoodPlank[] = [];
//     planks.forEach((plank) => {
//       for (let i = 0; i < plank.quantity; i++) {
//         expandedPlanks.push({ ...plank, quantity: 1 });
//       }
//     });

//     // Étendre les découpes en fonction de leur quantité
//     const expandedCuts = this.expandCuts(cuts);

//     // Trier les découpes par aire décroissante
//     const sortedCuts = expandedCuts.sort(
//       (a, b) => b.length * b.width - a.length * a.width
//     );

//     const optimizedPlanks: OptimizedPlank[] = [];
//     const unplacedCuts: RequiredCut[] = [];

//     for (const cut of sortedCuts) {
//       let placed = false;

//       // Essayer de placer sur les planches déjà utilisées
//       for (const optimizedPlank of optimizedPlanks) {
//         const placement = this.findBestPosition(optimizedPlank, cut);
//         if (placement) {
//           optimizedPlank.placements.push(placement);
//           this.updatePlankStats(optimizedPlank);
//           placed = true;
//           break;
//         }
//       }

//       // Si non placé, utiliser une nouvelle planche
//       if (!placed) {
//         const nextPlank = expandedPlanks.shift();
//         if (nextPlank) {
//           const newOptimizedPlank = this.createOptimizedPlank(nextPlank);
//           const placement = this.findBestPosition(newOptimizedPlank, cut);
//           if (placement) {
//             newOptimizedPlank.placements.push(placement);
//             this.updatePlankStats(newOptimizedPlank);
//             optimizedPlanks.push(newOptimizedPlank);
//             placed = true;
//           }
//         }
//       }

//       if (!placed) unplacedCuts.push(cut);
//     }

//     return this.calculateResults(optimizedPlanks, unplacedCuts);
//   }

//   private expandCuts(cuts: RequiredCut[]): RequiredCut[] {
//     const expanded: RequiredCut[] = [];
//     cuts.forEach((cut) => {
//       for (let i = 0; i < cut.quantity; i++) {
//         expanded.push({ ...cut, id: `${cut.id}_${i}`, quantity: 1 });
//       }
//     });
//     return expanded;
//   }

//   private createOptimizedPlank(plank: WoodPlank): OptimizedPlank {
//     return {
//       plank,
//       placements: [],
//       wasteArea: plank.length * plank.width,
//       wasteLength: plank.length, // initialisé à la longueur totale
//       efficiency: 0,
//     };
//   }

//   private findBestPosition(
//     optimizedPlank: OptimizedPlank,
//     cut: RequiredCut
//   ): CutPlacement | null {
//     const { plank } = optimizedPlank;
//     const orientations = [
//       { length: cut.length, width: cut.width, rotated: false },
//       { length: cut.width, width: cut.length, rotated: true },
//     ];

//     for (const o of orientations) {
//       if (
//         o.length > plank.length + this.tolerance ||
//         o.width > plank.width + this.tolerance
//       )
//         continue;
//       const pos = this.findBottomLeftPosition(
//         optimizedPlank,
//         o.length,
//         o.width
//       );
//       if (pos) {
//         return { cut, x: pos.x, y: pos.y, rotated: o.rotated };
//       }
//     }
//     return null;
//   }

//   private findBottomLeftPosition(
//     optimizedPlank: OptimizedPlank,
//     length: number,
//     width: number
//   ): { x: number; y: number } | null {
//     const candidates = [{ x: 0, y: 0 }];

//     optimizedPlank.placements.forEach((p) => {
//       const cutLength = p.rotated ? p.cut.width : p.cut.length;
//       const cutWidth = p.rotated ? p.cut.length : p.cut.width;
//       // Ajouter la tolérance de la lame
//       candidates.push(
//         { x: p.x + cutLength + this.sawThickness, y: p.y },
//         { x: p.x, y: p.y + cutWidth + this.sawThickness }
//       );
//     });

//     candidates.sort((a, b) => a.y - b.y || a.x - b.x);

//     for (const c of candidates) {
//       if (this.isValidPosition(optimizedPlank, c.x, c.y, length, width))
//         return c;
//     }

//     return null;
//   }

//   private isValidPosition(
//     optimizedPlank: OptimizedPlank,
//     x: number,
//     y: number,
//     length: number,
//     width: number
//   ): boolean {
//     const { plank, placements } = optimizedPlank;

//     if (
//       x + length > plank.length + this.tolerance ||
//       y + width > plank.width + this.tolerance
//     )
//       return false;

//     for (const p of placements) {
//       const cutLength = p.rotated ? p.cut.width : p.cut.length;
//       const cutWidth = p.rotated ? p.cut.length : p.cut.width;

//       if (
//         this.rectanglesOverlap(
//           x,
//           y,
//           length,
//           width,
//           p.x,
//           p.y,
//           cutLength,
//           cutWidth
//         )
//       )
//         return false;
//     }

//     return true;
//   }

//   private rectanglesOverlap(
//     x1: number,
//     y1: number,
//     w1: number,
//     h1: number,
//     x2: number,
//     y2: number,
//     w2: number,
//     h2: number
//   ): boolean {
//     return !(
//       x1 + w1 <= x2 + this.tolerance ||
//       x2 + w2 <= x1 + this.tolerance ||
//       y1 + h1 <= y2 + this.tolerance ||
//       y2 + h2 <= y1 + this.tolerance
//     );
//   }

//   private updatePlankStats(optimizedPlank: OptimizedPlank): void {
//     const { plank, placements } = optimizedPlank;

//     let usedLength = 0;
//     placements.forEach((p) => {
//       const cutLength = p.rotated ? p.cut.width : p.cut.length;
//       usedLength += cutLength;
//     });

//     optimizedPlank.wasteLength = plank.length - usedLength; // longueur restante en mm

//     // Calcul d’efficacité basé sur longueur
//     optimizedPlank.efficiency = (usedLength / plank.length) * 100;

//     // Optionnel : calcul surface pour info
//     const totalArea = plank.length * plank.width;
//     let usedArea = 0;
//     placements.forEach((p) => {
//       const cutLength = p.rotated ? p.cut.width : p.cut.length;
//       const cutWidth = p.rotated ? p.cut.length : p.cut.width;
//       usedArea += cutLength * cutWidth;
//     });
//     optimizedPlank.wasteArea = totalArea - usedArea;
//   }

//   private calculateResults(
//     optimizedPlanks: OptimizedPlank[],
//     unplacedCuts: RequiredCut[]
//   ): OptimizationResult {
//     const totalWasteArea = optimizedPlanks.reduce(
//       (sum, p) => sum + p.wasteArea,
//       0
//     );
//     const totalLengthWaste = optimizedPlanks.reduce(
//       (sum, p) => sum + (p.wasteLength ?? 0),
//       0
//     );
//     const totalArea = optimizedPlanks.reduce(
//       (sum, p) => sum + p.plank.length * p.plank.width,
//       0
//     );
//     const totalEfficiency =
//       totalArea > 0 ? ((totalArea - totalWasteArea) / totalArea) * 100 : 0;

//     console.log(optimizedPlanks);
//     return {
//       optimizedPlanks,
//       totalWaste: totalLengthWaste,
//       totalEfficiency,
//       planksUsed: optimizedPlanks.length,
//       unplacedCuts,
//     };
//   }
// }

// export const optimizer = new WoodCutOptimizer();

import type {
  WoodPlank,
  RequiredCut,
  OptimizationResult,
  OptimizedPlank,
  CutPlacement,
} from "../types";

export class WoodCutOptimizer {
  private tolerance = 0.1;
  private sawThickness = 4; // épaisseur de la lame en mm

  optimize(planks: WoodPlank[], cuts: RequiredCut[]): OptimizationResult {
    // Étendre les planches en fonction de leur quantité
    const expandedPlanks: WoodPlank[] = [];
    planks.forEach((plank) => {
      for (let i = 0; i < plank.quantity; i++) {
        expandedPlanks.push({ ...plank, quantity: 1 });
      }
    });

    // Étendre les découpes en fonction de leur quantité
    const expandedCuts = this.expandCuts(cuts);

    // Trier les découpes par aire décroissante
    const sortedCuts = expandedCuts.sort(
      (a, b) => b.length * b.width - a.length * a.width
    );

    const optimizedPlanks: OptimizedPlank[] = [];
    const unplacedCuts: RequiredCut[] = [];

    for (const cut of sortedCuts) {
      let placed = false;

      // Essayer de placer sur les planches déjà utilisées
      let bestPlank: OptimizedPlank | null = null;
      let bestPlacement: CutPlacement | null = null;

      for (const optimizedPlank of optimizedPlanks) {
        const placement = this.findBestPositionImproved(optimizedPlank, cut);
        if (placement) {
          // Choisir la meilleure planche (celle qui réduit le plus le gaspillage)
          const plankWaste =
            optimizedPlank.plank.length -
            (placement.x + (placement.rotated ? cut.width : cut.length));
          if (
            plankWaste <
            (bestPlacement
              ? bestPlank!.plank.length -
                (bestPlacement.x +
                  (bestPlacement.rotated ? cut.width : cut.length))
              : Infinity)
          ) {
            bestPlacement = placement;
            bestPlank = optimizedPlank;
          }
        }
      }

      if (bestPlacement && bestPlank) {
        bestPlank.placements.push(bestPlacement);
        this.updatePlankStats(bestPlank);
        placed = true;
      }

      // Si non placé, utiliser une nouvelle planche
      if (!placed) {
        const nextPlank = expandedPlanks.shift();
        if (nextPlank) {
          const newOptimizedPlank = this.createOptimizedPlank(nextPlank);
          const placement = this.findBestPositionImproved(
            newOptimizedPlank,
            cut
          );
          if (placement) {
            newOptimizedPlank.placements.push(placement);
            this.updatePlankStats(newOptimizedPlank);
            optimizedPlanks.push(newOptimizedPlank);
            placed = true;
          }
        }
      }

      if (!placed) unplacedCuts.push(cut);
    }

    return this.calculateResults(optimizedPlanks, unplacedCuts);
  }

  private expandCuts(cuts: RequiredCut[]): RequiredCut[] {
    const expanded: RequiredCut[] = [];
    cuts.forEach((cut) => {
      for (let i = 0; i < cut.quantity; i++) {
        expanded.push({ ...cut, id: `${cut.id}_${i}`, quantity: 1 });
      }
    });
    return expanded;
  }

  private createOptimizedPlank(plank: WoodPlank): OptimizedPlank {
    return {
      plank,
      placements: [],
      wasteArea: plank.length * plank.width,
      wasteLength: plank.length,
      efficiency: 0,
    };
  }

  private findBestPositionImproved(
    optimizedPlank: OptimizedPlank,
    cut: RequiredCut
  ): CutPlacement | null {
    const orientations = [
      { length: cut.length, width: cut.width, rotated: false },
      { length: cut.width, width: cut.length, rotated: true },
    ];

    let bestPlacement: CutPlacement | null = null;
    let minWaste = Infinity;

    for (const o of orientations) {
      if (
        o.length > optimizedPlank.plank.length + this.tolerance ||
        o.width > optimizedPlank.plank.width + this.tolerance
      )
        continue;

      const candidates = this.getCandidatePositions(optimizedPlank);
      for (const c of candidates) {
        if (!this.isValidPosition(optimizedPlank, c.x, c.y, o.length, o.width))
          continue;

        const wasteIfPlaced = optimizedPlank.plank.length - (c.x + o.length);

        if (wasteIfPlaced < minWaste) {
          minWaste = wasteIfPlaced;
          bestPlacement = { cut, x: c.x, y: c.y, rotated: o.rotated };
        }
      }
    }

    return bestPlacement;
  }

  private getCandidatePositions(optimizedPlank: OptimizedPlank) {
    const candidates = [{ x: 0, y: 0 }];
    optimizedPlank.placements.forEach((p) => {
      const cutLength = p.rotated ? p.cut.width : p.cut.length;
      const cutWidth = p.rotated ? p.cut.length : p.cut.width;
      candidates.push(
        { x: p.x + cutLength + this.sawThickness, y: p.y },
        { x: p.x, y: p.y + cutWidth + this.sawThickness }
      );
    });
    return candidates.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  private isValidPosition(
    optimizedPlank: OptimizedPlank,
    x: number,
    y: number,
    length: number,
    width: number
  ): boolean {
    const { plank, placements } = optimizedPlank;

    if (
      x + length > plank.length + this.tolerance ||
      y + width > plank.width + this.tolerance
    )
      return false;

    for (const p of placements) {
      const cutLength = p.rotated ? p.cut.width : p.cut.length;
      const cutWidth = p.rotated ? p.cut.length : p.cut.width;

      if (
        this.rectanglesOverlap(
          x,
          y,
          length,
          width,
          p.x,
          p.y,
          cutLength,
          cutWidth
        )
      )
        return false;
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

    let usedLength = 0;
    placements.forEach((p) => {
      const cutLength = p.rotated ? p.cut.width : p.cut.length;
      usedLength += cutLength;
    });

    optimizedPlank.wasteLength = plank.length - usedLength;
    optimizedPlank.efficiency = (usedLength / plank.length) * 100;

    const totalArea = plank.length * plank.width;
    let usedArea = 0;
    placements.forEach((p) => {
      const cutLength = p.rotated ? p.cut.width : p.cut.length;
      const cutWidth = p.rotated ? p.cut.length : p.cut.width;
      usedArea += cutLength * cutWidth;
    });
    optimizedPlank.wasteArea = totalArea - usedArea;
  }

  private calculateResults(
    optimizedPlanks: OptimizedPlank[],
    unplacedCuts: RequiredCut[]
  ): OptimizationResult {
    const totalWasteArea = optimizedPlanks.reduce(
      (sum, p) => sum + p.wasteArea,
      0
    );
    const totalLengthWaste = optimizedPlanks.reduce(
      (sum, p) => sum + (p.wasteLength ?? 0),
      0
    );
    const totalArea = optimizedPlanks.reduce(
      (sum, p) => sum + p.plank.length * p.plank.width,
      0
    );
    const totalEfficiency =
      totalArea > 0 ? ((totalArea - totalWasteArea) / totalArea) * 100 : 0;

    return {
      optimizedPlanks,
      totalWaste: totalLengthWaste,
      totalEfficiency,
      planksUsed: optimizedPlanks.length,
      unplacedCuts,
    };
  }
}

export const optimizer = new WoodCutOptimizer();
