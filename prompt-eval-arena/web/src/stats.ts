export interface StatsResult {
  pValue: number;
  significant: boolean;
  effectSize: number; // Cohen's d
  wStatistic: number;
  zScore: number;
}

// Standard normal CDF approximation (Hart's method / Abramowitz & Stegun)
export function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.39894228 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
}

/**
 * Computes Wilcoxon Signed-Rank Test for two paired arrays.
 * Assumes arrays are of equal length.
 */
export function wilcoxonSignedRankTest(a: number[], b: number[]): StatsResult {
  const n = a.length;
  const differences: { diff: number; absDiff: number; sign: number }[] = [];

  for (let i = 0; i < n; i++) {
    const diff = a[i] - b[i];
    if (diff !== 0) {
      differences.push({ diff, absDiff: Math.abs(diff), sign: Math.sign(diff) });
    }
  }

  const nr = differences.length;
  if (nr < 5) {
    // Too few samples for normal approximation
    return { pValue: 1.0, significant: false, effectSize: 0, wStatistic: 0, zScore: 0 };
  }

  // Sort by absolute difference
  differences.sort((x, y) => x.absDiff - y.absDiff);

  // Assign ranks (handle ties by averaging)
  const ranks = new Array(nr).fill(0);
  let i = 0;
  while (i < nr) {
    let j = i;
    while (j < nr && differences[j].absDiff === differences[i].absDiff) {
      j++;
    }
    const averageRank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      ranks[k] = averageRank;
    }
    i = j;
  }

  // Sum positive and negative ranks
  let wPlus = 0;
  let wMinus = 0;
  for (let k = 0; k < nr; k++) {
    if (differences[k].sign > 0) {
      wPlus += ranks[k];
    } else {
      wMinus += ranks[k];
    }
  }

  const wStat = Math.min(wPlus, wMinus);
  const meanW = (nr * (nr + 1)) / 4;
  const varW = (nr * (nr + 1) * (2 * nr + 1)) / 24;
  const stdW = Math.sqrt(varW);

  // Z-score with continuity correction
  const z = (Math.abs(wStat - meanW) - 0.5) / stdW;
  const pVal = 2 * normalCDF(-Math.abs(z));

  // Compute Cohen's d effect size for paired samples
  const diffs = a.map((val, idx) => val - b[idx]);
  const meanDiff = diffs.reduce((sum, v) => sum + v, 0) / n;
  const varianceDiff = diffs.reduce((sum, v) => sum + Math.pow(v - meanDiff, 2), 0) / (n - 1);
  const stdDiff = Math.sqrt(varianceDiff || 0.001);

  const cohensD = meanDiff / stdDiff;

  return {
    pValue: Math.round(pVal * 10000) / 10000,
    significant: pVal < 0.05,
    effectSize: Math.round(cohensD * 100) / 100,
    wStatistic: wStat,
    zScore: Math.round(z * 100) / 100
  };
}
