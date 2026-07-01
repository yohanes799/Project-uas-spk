export interface Criterion {
  id: string;
  name: string;
  weight: number; // from AHP
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>; // criterionId -> numeric value
}

export interface AHPPairwiseMatrix {
  [rowId: string]: {
    [colId: string]: number;
  };
}

export interface AHPResult {
  weights: Record<string, number>; // criterionId -> weight
  consistencyIndex: number;
  consistencyRatio: number;
  lambdaMax: number;
  normalizedMatrix: Record<string, Record<string, number>>;
  isConsistent: boolean;
}

export interface SAWResult {
  normalizedMatrix?: Record<string, Record<string, number>>; // altId -> critId -> value
  rankings: RankingEntry[];
}

export interface RankingEntry {
  alternativeId: string;
  alternativeName: string;
  preferenceValue: number;
  rank: number;
}

export interface HybridResult {
  ahpResult: AHPResult;
  sawResult: SAWResult;
}

export type CriterionType = 'benefit' | 'cost';

export interface CriterionConfig {
  id: string;
  name: string;
  type: CriterionType;
}
