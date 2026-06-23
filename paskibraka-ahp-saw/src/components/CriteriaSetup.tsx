import React from 'react';
import type { Criterion, CriterionConfig } from '../types';

interface CriteriaSetupProps {
  criteria: Criterion[];
  criteriaConfig: CriterionConfig[];
  onCriteriaChange: (criteria: Criterion[]) => void;
  onCriteriaConfigChange: (config: CriterionConfig[]) => void;
  onNext: () => void;
}

const CriteriaSetup: React.FC<CriteriaSetupProps> = ({
  criteria,
  criteriaConfig,
  onCriteriaChange,
  onCriteriaConfigChange,
  onNext,
}) => {
  const addCriterion = () => {
    const newId = `C${criteria.length + 1}`;
    onCriteriaChange([...criteria, { id: newId, name: '', weight: 0 }]);
    onCriteriaConfigChange([...criteriaConfig, { id: newId, name: '', type: 'benefit' }]);
  };

  const removeCriterion = (id: string) => {
    if (criteria.length <= 2) { alert('Minimal harus ada 2 kriteria.'); return; }
    onCriteriaChange(criteria.filter((c) => c.id !== id));
    onCriteriaConfigChange(criteriaConfig.filter((c) => c.id !== id));
  };

  const updateName = (id: string, name: string) => {
    onCriteriaChange(criteria.map((c) => (c.id === id ? { ...c, name } : c)));
    onCriteriaConfigChange(criteriaConfig.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const updateType = (id: string, type: 'benefit' | 'cost') => {
    onCriteriaConfigChange(criteriaConfig.map((c) => (c.id === id ? { ...c, type } : c)));
  };

  const canProceed = criteria.every((c) => c.name.trim() !== '');

  return (
    <div className="p-8 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Langkah 1: Setup Kriteria</h2>
        <p className="text-gray-500 text-sm">
          Tentukan kriteria seleksi. Pilih <span className="font-semibold text-green-600">Benefit</span> jika nilai lebih besar = lebih baik,
          atau <span className="font-semibold text-red-500">Cost</span> jika nilai lebih kecil = lebih baik.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">ID</th>
              <th className="px-4 py-3 text-left font-semibold">Nama Kriteria</th>
              <th className="px-4 py-3 text-left font-semibold">Tipe</th>
              <th className="px-4 py-3 text-left font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {criteria.map((crit) => {
              const config = criteriaConfig.find((c) => c.id === crit.id);
              return (
                <tr key={crit.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {crit.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => updateName(crit.id, e.target.value)}
                      placeholder="Nama kriteria..."
                      className="w-full min-w-[180px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                      aria-label={`Nama kriteria ${crit.id}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={config?.type ?? 'benefit'}
                      onChange={(e) => updateType(crit.id, e.target.value as 'benefit' | 'cost')}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition"
                      aria-label={`Tipe kriteria ${crit.id}`}
                    >
                      <option value="benefit">✅ Benefit</option>
                      <option value="cost">❌ Cost</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeCriterion(crit.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={addCriterion}
          className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
        >
          + Tambah Kriteria
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition"
        >
          Lanjut ke Matriks AHP →
        </button>
      </div>

      {!canProceed && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span>⚠</span>
          <span>Semua kriteria harus memiliki nama.</span>
        </div>
      )}
    </div>
  );
};

export default CriteriaSetup;
