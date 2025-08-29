import type {
  WoodPlank,
  RequiredCut,
  OptimizationResult,
  OptimizedPlank,
  CutPlacement,
} from "../types";

type SeqGene = {
  id: string; // id unique (avec suffixe _i après expansion)
  rotate: boolean; // orientation préférée (peut être ignorée si impossible)
};

export class WoodCutOptimizer {
  private tolerance = 0.1;
  private sawThickness = 4; // mm

  // ==== Public API ===========================================================
  optimize(planks: WoodPlank[], cuts: RequiredCut[]): OptimizationResult {
    // Fallback vers le recuit simulé
    return this.optimizeWithSimulatedAnnealing(planks, cuts, {
      iterations: 2000, // augmente si tu veux chercher plus
      startTemp: 1.0,
      endTemp: 0.01,
      neighborPerIter: 3, // nb de voisins testés par itération
      unplacedPenalty: 1e9, // pénalité massive si une coupe n'est pas placée
      randomRestarts: 2, // redémarrages aléatoires (garde la meilleure)
      seed: 42, // pour reproductibilité
    });
  }

  // ==== Métaheuristique : Recuit simulé =====================================
  private optimizeWithSimulatedAnnealing(
    planks: WoodPlank[],
    cuts: RequiredCut[],
    cfg: {
      iterations: number;
      startTemp: number;
      endTemp: number;
      neighborPerIter: number;
      unplacedPenalty: number;
      randomRestarts: number;
      seed?: number;
    }
  ): OptimizationResult {
    const rng = this.makeRng(cfg.seed ?? Date.now());
    const expandedPlanks = this.expandPlanks(planks);
    const expandedCuts = this.expandCuts(cuts);

    const mkInitialSeq = (): SeqGene[] =>
      this.shuffle(
        expandedCuts.map((c) => ({ id: c.id!, rotate: rng() < 0.5 })),
        rng
      );

    let globalBest: { result: OptimizationResult; fitness: number } | null =
      null;

    for (let restart = 0; restart <= cfg.randomRestarts; restart++) {
      let seq = mkInitialSeq();
      let { result: currRes, fitness: currFit } = this.evaluateSequence(
        expandedPlanks,
        expandedCuts,
        seq,
        cfg.unplacedPenalty
      );
      let bestFit = currFit;
      let bestRes = currRes;

      for (let it = 0; it < cfg.iterations; it++) {
        const t = this.temperature(
          it,
          cfg.iterations,
          cfg.startTemp,
          cfg.endTemp
        );

        let localBestSeq = seq;
        let localBestFit = currFit;
        let localBestRes = currRes;

        for (let k = 0; k < cfg.neighborPerIter; k++) {
          const neighbor = this.makeNeighbor(seq, rng);
          const { result: neighRes, fitness: neighFit } = this.evaluateSequence(
            expandedPlanks,
            expandedCuts,
            neighbor,
            cfg.unplacedPenalty
          );

          if (neighFit < localBestFit) {
            localBestFit = neighFit;
            localBestSeq = neighbor;
            localBestRes = neighRes;
          }
        }

        const accept =
          localBestFit < currFit ||
          rng() < Math.exp((currFit - localBestFit) / Math.max(1e-9, t));
        if (accept) {
          seq = localBestSeq;
          currFit = localBestFit;
          currRes = localBestRes;

          if (currFit < bestFit) {
            bestFit = currFit;
            bestRes = currRes;
          }
        }
      }

      if (!globalBest || bestFit < globalBest.fitness) {
        globalBest = { result: bestRes, fitness: bestFit };
      }
    }

    return globalBest!.result;
  }

  private temperature(
    it: number,
    maxIt: number,
    t0: number,
    tf: number
  ): number {
    const alpha = Math.pow(tf / t0, it / Math.max(1, maxIt - 1));
    return t0 * alpha;
  }

  private makeNeighbor(seq: SeqGene[], rng: () => number): SeqGene[] {
    const neighbor = [...seq];
    const op = Math.floor(rng() * 3);
    if (op === 0 && neighbor.length >= 2) {
      const i = Math.floor(rng() * neighbor.length);
      let j = Math.floor(rng() * neighbor.length);
      if (i === j) j = (j + 1) % neighbor.length;
      [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
    } else if (op === 1) {
      const i = Math.floor(rng() * neighbor.length);
      const j = Math.floor(rng() * neighbor.length);
      const a = Math.min(i, j),
        b = Math.max(i, j);
      const segment = neighbor.slice(a, b + 1).reverse();
      neighbor.splice(a, segment.length, ...segment);
    } else {
      const i = Math.floor(rng() * neighbor.length);
      neighbor[i] = { ...neighbor[i], rotate: !neighbor[i].rotate };
    }
    return neighbor;
  }

  private evaluateSequence(
    planks: WoodPlank[],
    expandedCuts: RequiredCut[],
    seq: SeqGene[],
    unplacedPenalty: number
  ): { result: OptimizationResult; fitness: number } {
    const cutsById = new Map(expandedCuts.map((c) => [c.id!, c]));
    const orderedCuts: RequiredCut[] = [];
    for (const g of seq) {
      const c = cutsById.get(g.id);
      if (c) orderedCuts.push({ ...c });
    }

    const { optimizedPlanks, unplacedCuts } = this.packBottomLeft(
      planks,
      orderedCuts,
      seq
    );

    const wasteArea = optimizedPlanks.reduce((s, p) => s + p.wasteArea, 0);
    const fitness =
      wasteArea +
      (unplacedCuts.length > 0 ? unplacedPenalty * unplacedCuts.length : 0);

    const result = this.calculateResults(optimizedPlanks, unplacedCuts);
    return { result, fitness };
  }

  private packBottomLeft(
    planks: WoodPlank[],
    cutsInOrder: RequiredCut[],
    seq: SeqGene[]
  ): { optimizedPlanks: OptimizedPlank[]; unplacedCuts: RequiredCut[] } {
    const optimizedPlanks: OptimizedPlank[] = [];
    const unplacedCuts: RequiredCut[] = [];
    const orientMap = new Map(seq.map((g) => [g.id, g.rotate]));

    const stock: WoodPlank[] = this.expandPlanks(planks);

    for (const cut of cutsInOrder) {
      let placed = false;
      const preferredRotate = orientMap.get(cut.id!);

      let best: {
        plank: OptimizedPlank;
        placement: CutPlacement;
        score: number;
      } | null = null;
      for (const optPlank of optimizedPlanks) {
        const placement = this.findBestPositionWithPreferred(
          optPlank,
          cut,
          preferredRotate
        );
        if (placement) {
          const score =
            optPlank.plank.length -
            (placement.x + (placement.rotated ? cut.width : cut.length));
          if (!best || score < best.score)
            best = { plank: optPlank, placement, score };
        }
      }
      if (best) {
        best.plank.placements.push(best.placement);
        this.updatePlankStats(best.plank);
        placed = true;
      }

      if (!placed) {
        const next = stock.shift();
        if (next) {
          const newOpt = this.createOptimizedPlank(next);
          const placement = this.findBestPositionWithPreferred(
            newOpt,
            cut,
            preferredRotate
          );
          if (placement) {
            newOpt.placements.push(placement);
            this.updatePlankStats(newOpt);
            optimizedPlanks.push(newOpt);
            placed = true;
          } else {
            unplacedCuts.push(cut);
          }
        } else {
          unplacedCuts.push(cut);
        }
      }
    }

    return { optimizedPlanks, unplacedCuts };
  }

  private findBestPositionWithPreferred(
    optimizedPlank: OptimizedPlank,
    cut: RequiredCut,
    preferredRotate?: boolean
  ): CutPlacement | null {
    const orientations =
      preferredRotate == null
        ? [
            { length: cut.length, width: cut.width, rotated: false },
            { length: cut.width, width: cut.length, rotated: true },
          ]
        : preferredRotate
        ? [
            { length: cut.width, width: cut.length, rotated: true },
            { length: cut.length, width: cut.width, rotated: false },
          ]
        : [
            { length: cut.length, width: cut.width, rotated: false },
            { length: cut.width, width: cut.length, rotated: true },
          ];

    let best: CutPlacement | null = null;
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
          best = { cut, x: c.x, y: c.y, rotated: o.rotated };
        }
      }
    }
    return best;
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

  private expandPlanks(planks: WoodPlank[]): WoodPlank[] {
    const expanded: WoodPlank[] = [];
    planks.forEach((plank) => {
      for (let i = 0; i < plank.quantity; i++) {
        expanded.push({ ...plank, quantity: 1 });
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
      sawWasteArea: 0, // <-- ajouté ici
    };
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

    const totalArea = plank.length * plank.width;
    let usedArea = 0;
    let sawLoss = 0;

    placements.forEach((p) => {
      const cutLength = p.rotated ? p.cut.width : p.cut.length;
      const cutWidth = p.rotated ? p.cut.length : p.cut.width;
      usedArea += cutLength * cutWidth;

      // Estimer la perte due aux traits de scie (2 arêtes au moins par pièce)
      sawLoss += (cutLength + cutWidth) * this.sawThickness;
    });

    optimizedPlank.sawWasteArea = sawLoss; // <-- on stocke la perte scie
    optimizedPlank.wasteArea = totalArea - usedArea + sawLoss; // total perte
    optimizedPlank.wasteLength =
      plank.length -
      placements.reduce((s, p) => {
        const cutLength = p.rotated ? p.cut.width : p.cut.length;
        return s + cutLength;
      }, 0);

    optimizedPlank.efficiency =
      totalArea > 0
        ? ((totalArea - optimizedPlank.wasteArea) / totalArea) * 100
        : 0;
  }

  private calculateResults(
    optimizedPlanks: OptimizedPlank[],
    unplacedCuts: RequiredCut[]
  ): OptimizationResult {
    const totalWasteArea = optimizedPlanks.reduce(
      (sum, p) => sum + p.wasteArea,
      0
    );
    const totalWasteLength = optimizedPlanks.reduce(
      (sum, p) => sum + (p.wasteLength ?? 0),
      0
    );
    const totalArea = optimizedPlanks.reduce(
      (sum, p) => sum + p.plank.length * p.plank.width,
      0
    );

    const sawWasteArea = optimizedPlanks.reduce((sum, p) => {
      // ici tu peux stocker dans OptimizedPlank la part estimée due au trait de scie
      return sum + (p.sawWasteArea ?? 0);
    }, 0);

    const totalWaste = totalWasteArea; // si c’est la même chose
    const yieldPercent =
      totalArea > 0 ? ((totalArea - totalWasteArea) / totalArea) * 100 : 0;

    const cutsPlaced = optimizedPlanks.reduce(
      (s, p) => s + p.placements.length,
      0
    );

    return {
      optimizedPlanks,
      totalWasteArea,
      totalWasteLength,
      totalEfficiency: yieldPercent,
      planksUsed: optimizedPlanks.filter((p) => p.placements.length > 0).length,
      cutsPlaced,
      unplacedCuts,
      // champs manquants :
      totalWaste,
      yield: yieldPercent,
      sawWasteArea,
    };
  }

  // ==== Utils ================================================================
  private shuffle<T>(arr: T[], rng: () => number): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private makeRng(seed: number): () => number {
    let s = seed >>> 0;
    return () => {
      s = (1664525 * s + 1013904223) >>> 0;
      return (s & 0xfffffff) / 0x10000000;
    };
  }
}

export const optimizer = new WoodCutOptimizer();
