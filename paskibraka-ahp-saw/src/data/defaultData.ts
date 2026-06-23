import type { Alternative, Criterion, CriterionConfig } from '../types';
import type { AHPPairwiseMatrix } from '../types';

export const defaultCriteria: Criterion[] = [
  { id: 'C1', name: 'Tinggi Badan', weight: 0 },
  { id: 'C2', name: 'Riwayat Penyakit', weight: 0 },
  { id: 'C3', name: 'Mahir Baris Berbaris', weight: 0 },
  { id: 'C4', name: 'Berpenampilan Menarik', weight: 0 },
];

export const defaultCriteriaConfig: CriterionConfig[] = [
  { id: 'C1', name: 'Tinggi Badan', type: 'benefit' },
  { id: 'C2', name: 'Riwayat Penyakit', type: 'benefit' },
  { id: 'C3', name: 'Mahir Baris Berbaris', type: 'benefit' },
  { id: 'C4', name: 'Berpenampilan Menarik', type: 'benefit' },
];

// Pairwise comparison matrix from the paper (Table 3)
export const defaultPairwiseMatrix: AHPPairwiseMatrix = {
  C1: { C1: 1, C2: 3, C3: 5, C4: 9 },
  C2: { C1: 1 / 3, C2: 1, C3: 5, C4: 5 },
  C3: { C1: 1 / 5, C2: 1 / 5, C3: 1, C4: 7 },
  C4: { C1: 1 / 9, C2: 1 / 5, C3: 1 / 7, C4: 1 },
};

// Data from the paper (Table 2 - numeric values)
export const defaultAlternatives: Alternative[] = [
  { id: 'A1', name: 'Dandi',   values: { C1: 165, C2: 50,  C3: 100, C4: 100 } },
  { id: 'A2', name: 'Ardiman', values: { C1: 160, C2: 100, C3: 100, C4: 60  } },
  { id: 'A3', name: 'Wikara',  values: { C1: 160, C2: 50,  C3: 80,  C4: 80  } },
  { id: 'A4', name: 'Elzaki',  values: { C1: 175, C2: 100, C3: 100, C4: 100 } },
  { id: 'A5', name: 'Tami',    values: { C1: 170, C2: 100, C3: 80,  C4: 80  } },
  { id: 'A6', name: 'Ranto',   values: { C1: 167, C2: 100, C3: 100, C4: 80  } },
  { id: 'A7', name: 'Wijaya',  values: { C1: 164, C2: 100, C3: 40,  C4: 40  } },
  { id: 'A8', name: 'Sari',    values: { C1: 155, C2: 50,  C3: 80,  C4: 80  } },
  { id: 'A9', name: 'Sikali',  values: { C1: 170, C2: 100, C3: 100, C4: 60  } },
  { id: 'A10', name: 'Yuni',   values: { C1: 165, C2: 50,  C3: 80,  C4: 60  } },
];
