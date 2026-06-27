import { useState, useEffect } from 'react';
import './App.css';
import type { AHPPairwiseMatrix, AHPResult, Alternative, Criterion, CriterionConfig, SAWResult } from './types';
import { calculateAHP, createDefaultMatrix } from './utils/ahp';
import { calculateSAW } from './utils/saw';
import {
  defaultAlternatives,
  defaultCriteria,
  defaultCriteriaConfig,
  defaultPairwiseMatrix,
} from './data/defaultData';
import StepIndicator from './components/StepIndicator';
import CriteriaSetup from './components/CriteriaSetup';
import AHPMatrix from './components/AHPMatrix';
import AlternativesInput from './components/AlternativesInput';
import Results from './components/Results';
import LoginPage from './components/LoginPage';

const STEPS = [
  { label: 'Kriteria', description: 'Setup kriteria' },
  { label: 'Matriks AHP', description: 'Perbandingan berpasangan' },
  { label: 'Alternatif', description: 'Input data peserta' },
  { label: 'Hasil', description: 'Rangking final' },
];

function App() {
  const [loggedInRole, setLoggedInRole] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);
  const [criteriaConfig, setCriteriaConfig] = useState<CriterionConfig[]>(defaultCriteriaConfig);
  const [pairwiseMatrix, setPairwiseMatrix] = useState<AHPPairwiseMatrix>(defaultPairwiseMatrix);
  const [alternatives, setAlternatives] = useState<Alternative[]>(defaultAlternatives);
  const [ahpResult, setAhpResult] = useState<AHPResult | null>(null);
  const [sawResult, setSawResult] = useState<SAWResult | null>(null);

  // Recalculate AHP whenever matrix or criteria change
  useEffect(() => {
    if (criteria.length >= 2) {
      const result = calculateAHP(criteria, pairwiseMatrix);
      setAhpResult(result);
    }
  }, [criteria, pairwiseMatrix]);

  // Recalculate SAW when on step 4
  useEffect(() => {
    if (currentStep === 4 && ahpResult) {
      const result = calculateSAW(alternatives, criteriaConfig, ahpResult.weights);
      setSawResult(result);
    }
  }, [currentStep, alternatives, criteriaConfig, ahpResult]);

  const handleCriteriaChange = (newCriteria: Criterion[]) => {
    setCriteria(newCriteria);
    // Reset matrix when criteria change
    const newMatrix = createDefaultMatrix(newCriteria);
    setPairwiseMatrix(newMatrix);
  };

  const handleReset = () => {
    setCriteria(defaultCriteria);
    setCriteriaConfig(defaultCriteriaConfig);
    setPairwiseMatrix(defaultPairwiseMatrix);
    setAlternatives(defaultAlternatives);
    setAhpResult(null);
    setSawResult(null);
    setCurrentStep(1);
  };

  const handleLogout = () => {
    setLoggedInRole(null);
    setCurrentStep(1);
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) setCurrentStep(step);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Login gate */}
      {!loggedInRole && <LoginPage onLogin={setLoggedInRole} />}

      {/* Main app — only shown when logged in */}
      {loggedInRole && (
        <>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none" aria-hidden="true">🏁</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">Seleksi Paskibraka</h1>
                  <p className="text-xs text-gray-500">Sistem Pendukung Keputusan — Metode Hybrid AHP-SAW</p>
                </div>
              </div>

              {/* Right side: role badge + buttons */}
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  {loggedInRole}
                </span>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                >
                  Reset Data
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Main */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
            <StepIndicator steps={STEPS} currentStep={currentStep} onStepClick={goToStep} />

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {currentStep === 1 && (
                <CriteriaSetup
                  criteria={criteria}
                  criteriaConfig={criteriaConfig}
                  onCriteriaChange={handleCriteriaChange}
                  onCriteriaConfigChange={setCriteriaConfig}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 2 && (
                <AHPMatrix
                  criteria={criteria}
                  matrix={pairwiseMatrix}
                  ahpResult={ahpResult}
                  onMatrixChange={setPairwiseMatrix}
                  onBack={() => setCurrentStep(1)}
                  onNext={() => setCurrentStep(3)}
                />
              )}
              {currentStep === 3 && (
                <AlternativesInput
                  criteria={criteria}
                  criteriaConfig={criteriaConfig}
                  alternatives={alternatives}
                  onAlternativesChange={setAlternatives}
                  onBack={() => setCurrentStep(2)}
                  onNext={() => setCurrentStep(4)}
                />
              )}
              {currentStep === 4 && ahpResult && sawResult && (
                <Results
                  criteria={criteria}
                  criteriaConfig={criteriaConfig}
                  ahpResult={ahpResult}
                  sawResult={sawResult}
                  onBack={() => setCurrentStep(3)}
                  onReset={handleReset}
                />
              )}
              {currentStep === 4 && (!ahpResult || !sawResult) && (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4" />
                  <p className="text-gray-500">Menghitung hasil...</p>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Referensi: <span className="font-semibold">Wibowo et al. (2023)</span> —{' '}
              <em>Seleksi Peserta Lomba Paskibraka Menggunakan Metode Hybrid AHP-SAW</em>,
              Journal of Information System Research (JOSH) Vol. 4, No. 3.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
