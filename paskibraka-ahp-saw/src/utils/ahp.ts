import type { AHPPairwiseMatrix, AHPResult, Criterion } from '../types';

// Random Consistency Index (RI) table for n = 1..10
const RI_TABLE: Record<number, number> = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.90,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

/**
 * Calculates AHP weights and consistency from a pairwise comparison matrix.
 * @param criteria - list of criteria
 * @param matrix - pairwise comparison matrix (value at [i][j] means "i is X times more important than j")
 */
export function calculateAHP(
  criteria: Criterion[],
  matrix: AHPPairwiseMatrix
): AHPResult {
  const n = criteria.length;
  const ids = criteria.map((c) => c.id);

  // Step 1: Calculate column sums
  const colSums: Record<string, number> = {};
  for (const colId of ids) {
    colSums[colId] = ids.reduce((sum, rowId) => sum + (matrix[rowId]?.[colId] ?? 1), 0);
  }

  // Step 2: Normalize the matrix
  const normalizedMatrix: Record<string, Record<string, number>> = {};
  for (const rowId of ids) {
    normalizedMatrix[rowId] = {};
    for (const colId of ids) {
      const val = matrix[rowId]?.[colId] ?? 1;
      normalizedMatrix[rowId][colId] = val / colSums[colId];
    }
  }

  // Step 3: Calculate criterion weights (row averages)
  const weights: Record<string, number> = {};
  for (const rowId of ids) {
    const rowSum = ids.reduce((sum, colId) => sum + normalizedMatrix[rowId][colId], 0);
    weights[rowId] = rowSum / n;
  }

  // Step 4: Calculate lambda max
  // weighted sum vector = matrix * weights
  const weightedSums: Record<string, number> = {};
  for (const rowId of ids) {
    weightedSums[rowId] = ids.reduce(
      (sum, colId) => sum + (matrix[rowId]?.[colId] ?? 1) * weights[colId],
      0
    );
  }

  // Lambda max = average of (weightedSum[i] / weight[i])
  const lambdaMax =
    ids.reduce((sum, id) => sum + weightedSums[id] / weights[id], 0) / n;

  // Step 5: Consistency Index
  const consistencyIndex = (lambdaMax - n) / (n - 1);

  // Step 6: Consistency Ratio
  const ri = RI_TABLE[n] ?? 1.49;
  const consistencyRatio = ri === 0 ? 0 : consistencyIndex / ri;

  return {
    weights,
    consistencyIndex,
    consistencyRatio,
    lambdaMax,
    normalizedMatrix,
    isConsistent: consistencyRatio <= 0.1,
  };
}

/**
 * Creates a default pairwise matrix (all values = 1)
 */
export function createDefaultMatrix(criteria: Criterion[]): AHPPairwiseMatrix {
  const matrix: AHPPairwiseMatrix = {};
  for (const row of criteria) {
    matrix[row.id] = {};
    for (const col of criteria) {
      matrix[row.id][col.id] = 1;
    }
  }
  return matrix;
}

/**
 * When user sets matrix[i][j] = v, automatically set matrix[j][i] = 1/v
 */
export function updateMatrixSymmetric(
  matrix: AHPPairwiseMatrix,
  rowId: string,
  colId: string,
  value: number
): AHPPairwiseMatrix {
  const updated = JSON.parse(JSON.stringify(matrix)) as AHPPairwiseMatrix;
  updated[rowId][colId] = value;
  if (rowId !== colId) {
    updated[colId][rowId] = 1 / value;
  }
  return updated;
}
