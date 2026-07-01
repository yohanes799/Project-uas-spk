import type { Alternative, CriterionConfig, SAWResult } from '../types';

/**
 * Calculates SAW (Simple Additive Weighting) rankings.
 * @param alternatives - list of alternatives with their criterion values
 * @param criteriaConfigs - criterion config (id, name, type: benefit|cost)
 * @param weights - criterion weights from AHP (criterionId -> weight)
 */
export function calculateSAW(
  alternatives: Alternative[],
  criteriaConfigs: CriterionConfig[],
  weights: Record<string, number>
): SAWResult {
  const altIds = alternatives.map((a) => a.id);
  const critIds = criteriaConfigs.map((c) => c.id);

// Step 1: Find max and min for each criterion (Paksa menjadi angka)
  const maxValues: Record<string, number> = {};
  const minValues: Record<string, number> = {};

  for (const critId of critIds) {
    // Paksa konversi ke Number agar Math.max/min tidak hancur oleh string
    const vals = alternatives.map((a) => Number(a.values[critId]) || 0);
    maxValues[critId] = Math.max(...vals);
    minValues[critId] = Math.min(...vals);
  }

  // Step 2: Normalize the decision matrix (Logika Anti-Jebakan)
  const normalizedMatrix: Record<string, Record<string, number>> = {};

  for (const alt of alternatives) {
    normalizedMatrix[alt.id] = {};
    for (const crit of criteriaConfigs) {
      const val = Number(alt.values[crit.id]) || 0;
      
      // BENTENG PERTAHANAN: Bersihkan teks dari huruf besar & spasi.
      // Jika kosong/salah, defaultkan sebagai 'benefit'.
      const isCost = String(crit.type).toLowerCase().trim() === 'cost';

      if (!isCost) {
        // BENEFIT (Default): r = x / max(x)
        normalizedMatrix[alt.id][crit.id] =
          maxValues[crit.id] === 0 ? 0 : val / maxValues[crit.id];
      } else {
        // COST: r = min(x) / x
        normalizedMatrix[alt.id][crit.id] =
          val === 0 ? 0 : minValues[crit.id] / val;
      }
    }
  }

  // Step 3: Calculate preference values Vi = sum(wj * rij)
  const preferenceValues: Record<string, number> = {};
  for (const altId of altIds) {
    preferenceValues[altId] = critIds.reduce((sum, critId) => {
      // Pastikan bobot juga dihitung murni sebagai angka
      const w = Number(weights[critId]) || 0;
      const r = normalizedMatrix[altId]?.[critId] ?? 0;
      return sum + w * r;
    }, 0);
  }

  // Step 4: Sort and rank
  const sorted = [...altIds].sort(
    (a, b) => preferenceValues[b] - preferenceValues[a]
  );

  const rankings = sorted.map((altId, index) => {
    const alt = alternatives.find((a) => a.id === altId)!;
    return {
      alternativeId: altId,
      alternativeName: alt.name,
      preferenceValue: preferenceValues[altId],
      rank: index + 1,
    };
  });

  return {
    normalizedMatrix,
    rankings,
  };
}
